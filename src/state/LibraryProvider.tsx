/**
 * Local listening library: favourites, history, per-track progress, Jaap
 * counts, listening streak and playback preferences. Everything is persisted with AsyncStorage. No account
 * or network is needed.
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
import { readJSON, StorageKeys, writeJSON } from '../storage/storage';
import { TOTAL_TRACKS } from '../data/tracks';

export const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5] as const;

export const JAAP_TARGETS = [11, 21, 51, 108] as const;

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}
export type PlaybackSpeed = (typeof SPEED_OPTIONS)[number];

export type PlaybackPrefs = {
  /** Default speed applied to every track; also changed from the player. */
  speed: PlaybackSpeed;
  /** Start a track from where the listener left off. */
  resumePosition: boolean;
  /** Continue to the next track when one finishes. */
  autoplayNext: boolean;
  /** Lyrics font size in px. */
  lyricsSize: number;
};

export type TrackProgress = {
  position: number;
  duration: number;
  completed: boolean;
  updatedAt: number;
};

export type HistoryEntry = { track: number; playedAt: number };

const DEFAULT_PREFS: PlaybackPrefs = {
  speed: 1,
  resumePosition: true,
  autoplayNext: true,
  lyricsSize: 20,
};

const MAX_HISTORY = 30;
const MAX_DAYS = 400;

export type JaapState = {
  target: number;
  /** Count in the current round (resets when the target is reached or on reset). */
  round: number;
  /** Completed rounds per day (YYYY-MM-DD) plus partial taps — total taps per day. */
  daily: Record<string, number>;
};

const DEFAULT_JAAP: JaapState = { target: 108, round: 0, daily: {} };

type LibraryContextValue = {
  loaded: boolean;
  prefs: PlaybackPrefs;
  updatePrefs: (patch: Partial<PlaybackPrefs>) => void;

  favorites: number[];
  isFavorite: (track: number) => boolean;
  toggleFavorite: (track: number) => void;

  history: HistoryEntry[];
  addToHistory: (track: number) => void;
  clearHistory: () => void;

  progress: Record<number, TrackProgress>;
  lastPlayed: number | null;
  saveProgress: (track: number, position: number, duration: number, completed?: boolean) => void;

  jaap: JaapState;
  /** Adds one tap. Returns true when this tap completed the round. */
  tapJaap: () => boolean;
  setJaapTarget: (target: number) => void;
  resetJaapRound: () => void;

  /** Days (YYYY-MM-DD) on which the user listened, oldest first. */
  listenDays: string[];
  streak: number;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function isValidTrack(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= TOTAL_TRACKS;
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [prefs, setPrefs] = useState<PlaybackPrefs>(DEFAULT_PREFS);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [progress, setProgress] = useState<Record<number, TrackProgress>>({});
  const [lastPlayed, setLastPlayed] = useState<number | null>(null);
  const [jaap, setJaap] = useState<JaapState>(DEFAULT_JAAP);
  const [listenDays, setListenDays] = useState<string[]>([]);

  // Hydrate once on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, f, h, pr, lp, ja, ld] = await Promise.all([
        readJSON<Partial<PlaybackPrefs>>(StorageKeys.playbackPrefs, {}),
        readJSON<number[]>(StorageKeys.favorites, []),
        readJSON<HistoryEntry[]>(StorageKeys.history, []),
        readJSON<Record<number, TrackProgress>>(StorageKeys.progress, {}),
        readJSON<number | null>(StorageKeys.lastPlayed, null),
        readJSON<Partial<JaapState>>(StorageKeys.jaap, {}),
        readJSON<string[]>(StorageKeys.listenDays, []),
      ]);
      if (cancelled) {
        return;
      }
      const speed = SPEED_OPTIONS.includes(p.speed as PlaybackSpeed)
        ? (p.speed as PlaybackSpeed)
        : DEFAULT_PREFS.speed;
      setPrefs({ ...DEFAULT_PREFS, ...p, speed });
      setFavorites(Array.isArray(f) ? f.filter(isValidTrack) : []);
      setHistory(Array.isArray(h) ? h.filter(e => isValidTrack(e?.track)) : []);
      setProgress(pr && typeof pr === 'object' ? pr : {});
      setLastPlayed(isValidTrack(lp) ? lp : null);
      setJaap({
        target: (JAAP_TARGETS as readonly number[]).includes(ja.target as number) ? (ja.target as number) : DEFAULT_JAAP.target,
        round: Number.isInteger(ja.round) && (ja.round as number) >= 0 ? (ja.round as number) : 0,
        daily: ja.daily && typeof ja.daily === 'object' ? ja.daily : {},
      });
      setListenDays(Array.isArray(ld) ? ld.filter(d => typeof d === 'string') : []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePrefs = useCallback((patch: Partial<PlaybackPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      writeJSON(StorageKeys.playbackPrefs, next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((track: number) => {
    setFavorites(prev => {
      const next = prev.includes(track)
        ? prev.filter(c => c !== track)
        : [...prev, track].sort((a, b) => a - b);
      writeJSON(StorageKeys.favorites, next);
      return next;
    });
  }, []);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);
  const isFavorite = useCallback((track: number) => favoritesSet.has(track), [favoritesSet]);

  const addToHistory = useCallback((track: number) => {
    setHistory(prev => {
      const next = [{ track, playedAt: Date.now() }, ...prev.filter(e => e.track !== track)].slice(
        0,
        MAX_HISTORY,
      );
      writeJSON(StorageKeys.history, next);
      return next;
    });
    setLastPlayed(track);
    writeJSON(StorageKeys.lastPlayed, track);
    const today = dayKey();
    setListenDays(prev => {
      if (prev[prev.length - 1] === today) {
        return prev;
      }
      const next = [...prev.filter(d => d !== today), today].slice(-MAX_DAYS);
      writeJSON(StorageKeys.listenDays, next);
      return next;
    });
  }, []);

  const tapJaap = useCallback(() => {
    let completed = false;
    setJaap(prev => {
      const today = dayKey();
      const round = prev.round + 1;
      completed = round >= prev.target;
      const next: JaapState = {
        ...prev,
        round: completed ? 0 : round,
        daily: { ...prev.daily, [today]: (prev.daily[today] ?? 0) + 1 },
      };
      writeJSON(StorageKeys.jaap, next);
      return next;
    });
    return completed;
  }, []);

  const setJaapTarget = useCallback((target: number) => {
    setJaap(prev => {
      const next = { ...prev, target, round: 0 };
      writeJSON(StorageKeys.jaap, next);
      return next;
    });
  }, []);

  const resetJaapRound = useCallback(() => {
    setJaap(prev => {
      const next = { ...prev, round: 0 };
      writeJSON(StorageKeys.jaap, next);
      return next;
    });
  }, []);

  const streak = useMemo(() => {
    const set = new Set(listenDays);
    const cursor = new Date();
    // Today not yet listened? The streak is still alive from yesterday.
    if (!set.has(dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    let count = 0;
    while (set.has(dayKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [listenDays]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeJSON(StorageKeys.history, []);
  }, []);

  // Progress writes are coalesced so frequent saves don't hammer storage.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(
    (track: number, position: number, duration: number, completed = false) => {
      if (!isValidTrack(track) || !Number.isFinite(position)) {
        return;
      }
      const entry: TrackProgress = {
        position: completed ? 0 : Math.max(0, position),
        duration: Number.isFinite(duration) && duration > 0 ? duration : progressRef.current[track]?.duration ?? 0,
        completed,
        updatedAt: Date.now(),
      };
      setProgress(prev => {
        const next = { ...prev, [track]: entry };
        if (writeTimer.current) {
          clearTimeout(writeTimer.current);
        }
        writeTimer.current = setTimeout(() => writeJSON(StorageKeys.progress, next), 300);
        return next;
      });
    },
    [],
  );

  useEffect(
    () => () => {
      if (writeTimer.current) {
        clearTimeout(writeTimer.current);
      }
    },
    [],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      loaded,
      prefs,
      updatePrefs,
      favorites,
      isFavorite,
      toggleFavorite,
      history,
      addToHistory,
      clearHistory,
      progress,
      lastPlayed,
      saveProgress,
      jaap,
      tapJaap,
      setJaapTarget,
      resetJaapRound,
      listenDays,
      streak,
    }),
    [
      loaded,
      prefs,
      updatePrefs,
      favorites,
      isFavorite,
      toggleFavorite,
      history,
      addToHistory,
      clearHistory,
      progress,
      lastPlayed,
      saveProgress,
      jaap,
      tapJaap,
      setJaapTarget,
      resetJaapRound,
      listenDays,
      streak,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used inside <LibraryProvider>');
  }
  return ctx;
}
