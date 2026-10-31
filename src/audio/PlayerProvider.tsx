/**
 * Central audio engine.
 *
 * Exactly one react-native-video element exists for the whole app. It is
 * keyed by track and retry session, so switching tracks tears down the
 * previous player before the next one starts. Two tracks can never overlap.
 *
 * State is split across three contexts so the frequent position updates
 * only re-render components that show progress:
 *   - PlayerStateContext    track, status, duration, speed, error  (changes rarely)
 *   - PlayerProgressContext position, buffered                       (about 2× per second)
 *   - PlayerActionsContext  stable callbacks                         (never changes)
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Video, {
  type OnBufferData,
  type OnLoadData,
  type OnPlaybackStateChangedData,
  type OnProgressData,
  type OnVideoErrorData,
  type VideoRef,
} from 'react-native-video';
import { getTrack, TOTAL_TRACKS } from '../data/tracks';
import { PlaybackSpeed, useLibrary } from '../state/LibraryProvider';

export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'buffering'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export type PlayerState = {
  trackNumber: number | null;
  status: PlaybackStatus;
  duration: number;
  speed: PlaybackSpeed;
  errorMessage: string | null;
  hasPrevious: boolean;
  hasNext: boolean;
  /** Epoch ms when the sleep timer fires, or null. */
  sleepAt: number | null;
};

export type PlayerProgress = { position: number; buffered: number };

export type PlayTrackOptions = {
  /** Seconds to start from. Defaults to the saved position when "resume" is on. */
  startAt?: number;
  /** Start playing as soon as audio is ready. Default true. */
  autoplay?: boolean;
};

export type PlayerActions = {
  playTrack: (trackNumber: number, options?: PlayTrackOptions) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  /** Jump relative to the current position (negative = back). */
  seekBy: (deltaSeconds: number) => void;
  /** Stop playback after this many minutes; null cancels. */
  setSleepTimer: (minutes: number | null) => void;
  next: () => void;
  previous: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  retry: () => void;
};

const PlayerStateContext = createContext<PlayerState | null>(null);
const PlayerProgressContext = createContext<PlayerProgress | null>(null);
const PlayerActionsContext = createContext<PlayerActions | null>(null);

/** Save the listening position at most this often (ms) while playing. */
const SAVE_INTERVAL_MS = 5000;
/** Don't resume into the last few seconds. Start the track fresh instead. */
const RESUME_END_GUARD_S = 10;

const ERROR_MESSAGE =
  'ऑडियो चल नहीं सका। कृपया पुनः प्रयास करें।';

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { prefs, updatePrefs, progress, saveProgress, addToHistory } = useLibrary();

  const videoRef = useRef<VideoRef>(null);

  const [trackNumber, setTrackNumber] = useState<number | null>(null);
  const [session, setSession] = useState(0); // bump to force a fresh native player
  const [wantsPlay, setWantsPlay] = useState(false); // user's intent
  const [loaded, setLoaded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [ended, setEnded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [progressState, setProgressState] = useState<PlayerProgress>({ position: 0, buffered: 0 });

  // Refs mirror state for use inside native callbacks without stale closures.
  const trackRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const durationRef = useRef(0);
  const startAtRef = useRef(0);
  const wantsPlayRef = useRef(false);
  const bufferingRef = useRef(false);
  const endedRef = useRef(false);
  const lastSaveRef = useRef(0);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const progressMapRef = useRef(progress);
  progressMapRef.current = progress;

  const setIntent = useCallback((value: boolean) => {
    wantsPlayRef.current = value;
    setWantsPlay(value);
  }, []);

  const persistPosition = useCallback(
    (completed = false) => {
      const ch = trackRef.current;
      if (ch == null) {
        return;
      }
      saveProgress(ch, positionRef.current, durationRef.current, completed);
      lastSaveRef.current = Date.now();
    },
    [saveProgress],
  );

  // ---- Actions -------------------------------------------------------------

  const playTrack = useCallback(
    (target: number, options: PlayTrackOptions = {}) => {
      if (!getTrack(target)) {
        return;
      }
      const autoplay = options.autoplay ?? true;

      // Same track already loaded (and healthy): just apply intent / seek.
      if (target === trackRef.current && !errorMessage) {
        if (options.startAt != null && loaded) {
          videoRef.current?.seek(options.startAt);
          positionRef.current = options.startAt;
          setProgressState(p => ({ ...p, position: options.startAt! }));
        }
        if (endedRef.current) {
          endedRef.current = false;
          setEnded(false);
          videoRef.current?.seek(0);
        }
        if (autoplay) {
          setIntent(true);
        }
        return;
      }

      // Leaving a track: remember where we were.
      if (trackRef.current != null && !endedRef.current) {
        persistPosition();
      }

      let startAt = options.startAt ?? 0;
      if (options.startAt == null && prefsRef.current.resumePosition) {
        const saved = progressMapRef.current[target];
        if (
          saved &&
          !saved.completed &&
          saved.position > 0 &&
          (saved.duration <= 0 || saved.position < saved.duration - RESUME_END_GUARD_S)
        ) {
          startAt = saved.position;
        }
      }

      trackRef.current = target;
      startAtRef.current = startAt;
      positionRef.current = startAt;
      durationRef.current = progressMapRef.current[target]?.duration ?? 0;
      endedRef.current = false;
      bufferingRef.current = false;

      setTrackNumber(target);
      setLoaded(false);
      setBuffering(false);
      setEnded(false);
      setErrorMessage(null);
      setDuration(durationRef.current);
      setProgressState({ position: startAt, buffered: 0 });
      setIntent(autoplay);
      setSession(s => s + 1);
      addToHistory(target);
    },
    [addToHistory, errorMessage, loaded, persistPosition, setIntent],
  );

  const play = useCallback(() => {
    if (trackRef.current == null) {
      return;
    }
    if (endedRef.current) {
      endedRef.current = false;
      setEnded(false);
      positionRef.current = 0;
      setProgressState(p => ({ ...p, position: 0 }));
      videoRef.current?.seek(0);
    }
    setIntent(true);
  }, [setIntent]);

  const pause = useCallback(() => {
    setIntent(false);
    persistPosition();
  }, [persistPosition, setIntent]);

  const togglePlayPause = useCallback(() => {
    if (wantsPlayRef.current && !endedRef.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (trackRef.current == null) {
        return;
      }
      const max = durationRef.current > 0 ? durationRef.current : seconds;
      const target = Math.max(0, Math.min(seconds, max));
      positionRef.current = target;
      setProgressState(p => ({ ...p, position: target }));
      if (endedRef.current) {
        endedRef.current = false;
        setEnded(false);
      }
      if (loaded) {
        videoRef.current?.seek(target);
      } else {
        startAtRef.current = target; // applied once the track loads
      }
      persistPosition();
    },
    [loaded, persistPosition],
  );

  const seekBy = useCallback(
    (delta: number) => seekTo(positionRef.current + delta),
    [seekTo],
  );

  // ---- Sleep timer -----------------------------------------------------------

  const [sleepAt, setSleepAt] = useState<number | null>(null);
  const sleepTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      if (sleepTimeout.current) {
        clearTimeout(sleepTimeout.current);
        sleepTimeout.current = null;
      }
      if (minutes == null) {
        setSleepAt(null);
        return;
      }
      setSleepAt(Date.now() + minutes * 60_000);
      sleepTimeout.current = setTimeout(() => {
        sleepTimeout.current = null;
        setSleepAt(null);
        setIntent(false);
        persistPosition();
      }, minutes * 60_000);
    },
    [persistPosition, setIntent],
  );

  const next = useCallback(() => {
    const ch = trackRef.current;
    if (ch != null && ch < TOTAL_TRACKS) {
      playTrack(ch + 1, { autoplay: true });
    }
  }, [playTrack]);

  const previous = useCallback(() => {
    const ch = trackRef.current;
    if (ch != null && ch > 1) {
      playTrack(ch - 1, { autoplay: true });
    }
  }, [playTrack]);

  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => updatePrefs({ speed }),
    [updatePrefs],
  );

  const retry = useCallback(() => {
    if (trackRef.current == null) {
      return;
    }
    startAtRef.current = positionRef.current;
    bufferingRef.current = false;
    setErrorMessage(null);
    setLoaded(false);
    setBuffering(false);
    setIntent(true);
    setSession(s => s + 1);
  }, [setIntent]);

  // ---- Native player callbacks ----------------------------------------------

  const onLoad = useCallback((e: OnLoadData) => {
    durationRef.current = e.duration;
    setDuration(e.duration);
    setLoaded(true);
    const startAt = startAtRef.current;
    if (startAt > 0 && startAt < e.duration) {
      videoRef.current?.seek(startAt);
    }
    startAtRef.current = 0;
  }, []);

  const onProgress = useCallback(
    (e: OnProgressData) => {
      positionRef.current = e.currentTime;
      setProgressState({ position: e.currentTime, buffered: e.playableDuration });
      if (e.seekableDuration > 0 && Math.abs(e.seekableDuration - durationRef.current) > 1) {
        durationRef.current = e.seekableDuration;
        setDuration(e.seekableDuration);
      }
      if (Date.now() - lastSaveRef.current > SAVE_INTERVAL_MS) {
        persistPosition();
      }
    },
    [persistPosition],
  );

  const onBuffer = useCallback((e: OnBufferData) => {
    bufferingRef.current = e.isBuffering;
    setBuffering(e.isBuffering);
  }, []);

  /**
   * Keeps JS in sync when playback is paused outside the app UI, e.g. from
   * the notification or lock screen. ExoPlayer also reports "not playing"
   * while buffering, so this waits briefly and ignores buffering and seeking.
   */
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPlaybackStateChanged = useCallback(
    (e: OnPlaybackStateChangedData) => {
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
      if (e.isSeeking) {
        return;
      }
      if (e.isPlaying && !wantsPlayRef.current) {
        setIntent(true);
      } else if (!e.isPlaying && wantsPlayRef.current) {
        syncTimer.current = setTimeout(() => {
          if (!bufferingRef.current && !endedRef.current && wantsPlayRef.current) {
            setIntent(false);
            persistPosition();
          }
        }, 600);
      }
    },
    [persistPosition, setIntent],
  );

  const onEnd = useCallback(() => {
    const ch = trackRef.current;
    if (ch == null) {
      return;
    }
    positionRef.current = durationRef.current;
    persistPosition(true);
    if (prefsRef.current.autoplayNext && ch < TOTAL_TRACKS) {
      playTrack(ch + 1, { autoplay: true, startAt: 0 });
      return;
    }
    // Last track, or autoplay off: stop at the end and offer replay.
    endedRef.current = true;
    setEnded(true);
    setIntent(false);
    setProgressState(p => ({ ...p, position: durationRef.current }));
  }, [persistPosition, playTrack, setIntent]);

  const onError = useCallback(
    (e: OnVideoErrorData) => {
      console.warn('[player] playback error', e.error?.errorString ?? e.error);
      persistPosition();
      setErrorMessage(ERROR_MESSAGE);
      setIntent(false);
      setBuffering(false);
      bufferingRef.current = false;
    },
    [persistPosition, setIntent],
  );

  const onAudioFocusChanged = useCallback(
    ({ hasAudioFocus }: { hasAudioFocus: boolean }) => {
      // Another app (or a call) took audio focus: pause, and let the user resume.
      if (!hasAudioFocus && wantsPlayRef.current) {
        setIntent(false);
        persistPosition();
      }
    },
    [persistPosition, setIntent],
  );

  const onAudioBecomingNoisy = useCallback(() => {
    // Headphones unplugged: never blast audio from the speaker.
    setIntent(false);
    persistPosition();
  }, [persistPosition, setIntent]);

  // Persist position whenever the app goes to the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', appState => {
      if (appState !== 'active') {
        persistPosition();
      }
    });
    return () => sub.remove();
  }, [persistPosition]);

  useEffect(
    () => () => {
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
      }
      if (sleepTimeout.current) {
        clearTimeout(sleepTimeout.current);
      }
    },
    [],
  );

  // ---- Derived state ---------------------------------------------------------

  let status: PlaybackStatus;
  if (trackNumber == null) {
    status = 'idle';
  } else if (errorMessage) {
    status = 'error';
  } else if (ended) {
    status = 'ended';
  } else if (!loaded) {
    status = 'loading';
  } else if (wantsPlay && buffering) {
    status = 'buffering';
  } else if (wantsPlay) {
    status = 'playing';
  } else {
    status = 'paused';
  }

  const state = useMemo<PlayerState>(
    () => ({
      trackNumber,
      status,
      duration,
      speed: prefs.speed,
      errorMessage,
      hasPrevious: trackNumber != null && trackNumber > 1,
      hasNext: trackNumber != null && trackNumber < TOTAL_TRACKS,
      sleepAt,
    }),
    [trackNumber, status, duration, prefs.speed, errorMessage, sleepAt],
  );

  // Callbacks change identity only when their inputs do. Expose a stable
  // object that always calls the latest version.
  const latest = useRef({ playTrack, play, pause, togglePlayPause, seekTo, seekBy, setSleepTimer, next, previous, setSpeed, retry });
  latest.current = { playTrack, play, pause, togglePlayPause, seekTo, seekBy, setSleepTimer, next, previous, setSpeed, retry };
  const actions = useMemo<PlayerActions>(
    () => ({
      playTrack: (n, o) => latest.current.playTrack(n, o),
      play: () => latest.current.play(),
      pause: () => latest.current.pause(),
      togglePlayPause: () => latest.current.togglePlayPause(),
      seekTo: s => latest.current.seekTo(s),
      seekBy: d => latest.current.seekBy(d),
      setSleepTimer: m => latest.current.setSleepTimer(m),
      next: () => latest.current.next(),
      previous: () => latest.current.previous(),
      setSpeed: s => latest.current.setSpeed(s),
      retry: () => latest.current.retry(),
    }),
    [],
  );

  const track = trackNumber != null ? getTrack(trackNumber) : undefined;

  // The audio is bundled in the app, so `uri` is a require() id. react-native-video resolves it.
  const source = useMemo(
    () =>
      track
        ? {
            uri: track.audio as unknown as string,
            metadata: {
              title: track.title,
              artist: 'हनुमान चालीसा और भक्ति',
              description: track.titleEnglish,
            },
          }
        : undefined,
    [track],
  );

  return (
    <PlayerActionsContext.Provider value={actions}>
      <PlayerStateContext.Provider value={state}>
        <PlayerProgressContext.Provider value={progressState}>
          {children}
          {source && !errorMessage ? (
            <View style={styles.hidden} pointerEvents="none" importantForAccessibility="no-hide-descendants">
              <Video
                key={`${trackNumber}-${session}`}
                ref={videoRef}
                source={source}
                paused={!wantsPlay}
                rate={prefs.speed}
                playInBackground
                playWhenInactive
                ignoreSilentSwitch="ignore"
                showNotificationControls
                progressUpdateInterval={500}
                onLoad={onLoad}
                onProgress={onProgress}
                onBuffer={onBuffer}
                onPlaybackStateChanged={onPlaybackStateChanged}
                onEnd={onEnd}
                onError={onError}
                onAudioFocusChanged={onAudioFocusChanged}
                onAudioBecomingNoisy={onAudioBecomingNoisy}
                style={styles.hidden}
              />
            </View>
          ) : null}
        </PlayerProgressContext.Provider>
      </PlayerStateContext.Provider>
    </PlayerActionsContext.Provider>
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 0, height: 0, opacity: 0 },
});

function useRequiredContext<T>(ctx: React.Context<T | null>, name: string): T {
  const value = useContext(ctx);
  if (value == null) {
    throw new Error(`${name} must be used inside <PlayerProvider>`);
  }
  return value;
}

export const usePlayerState = () => useRequiredContext(PlayerStateContext, 'usePlayerState');
export const usePlayerProgress = () => useRequiredContext(PlayerProgressContext, 'usePlayerProgress');
export const usePlayerActions = () => useRequiredContext(PlayerActionsContext, 'usePlayerActions');
