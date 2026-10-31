/**
 * Force-update state: compares the installed version with the one in
 * Firebase (/hanumanchalisaandbhakti) and locks the app behind the update screen when the
 * installed build is older. Read it in components with hooks/useAppUpdate.
 *
 * Rules
 * - Only a successful read with a valid version can lock the app.
 * - Firebase unreachable / bad data → the app opens and the check retries.
 * - A confirmed lock survives later network failures.
 * - Live listener: changing the version in Firebase locks/unlocks open apps.
 */
import DeviceInfo from 'react-native-device-info';
import { isUpdateRequired } from '../utils/appVersion';
import {
  fetchRequiredAppVersion,
  isFirebaseConfigured,
  RequiredAppVersion,
  subscribeRequiredAppVersion,
} from './appVersion';

export const RETRY_DELAYS_MS = [5000, 15000, 30000, 60000];
/** Foreground rechecks closer together than this are skipped (unless an update is already required). */
export const RECHECK_MIN_INTERVAL_MS = 60_000;
const FETCH_TIMEOUT_MS = 15000;

export type AppUpdateStatus = 'checking' | 'ok' | 'required';

export interface AppUpdateState {
  status:           AppUpdateStatus;
  installedVersion: string;
  requiredVersion:  string | null;
  storeUrl:         string | null;
  message:          string | null;
}

const INITIAL_STATE: AppUpdateState = {
  status:           'checking',
  installedVersion: '',
  requiredVersion:  null,
  storeUrl:         null,
  message:          null,
};

// ── tiny external store (read with useSyncExternalStore) ────────────────────
let state: AppUpdateState = INITIAL_STATE;
const listeners = new Set<() => void>();

export const getAppUpdateState = () => state;

export const subscribeAppUpdateState = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

function setState(patch: Partial<AppUpdateState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

// ── check logic ─────────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('App version request timed out')), ms);
    promise.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

let inFlight: Promise<void> | null = null;
let lastSuccessAt = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryAttempt = 0;
let unsubscribe: (() => void) | null = null;

function scheduleRetry() {
  if (retryTimer) return;
  const delay = RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)];
  retryAttempt += 1;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    checkForUpdate({ force: true });
  }, delay);
}

function applyConfig(config: RequiredAppVersion) {
  const installedVersion = DeviceInfo.getVersion();
  lastSuccessAt = Date.now();
  retryAttempt = 0;
  // A missing or malformed Firebase value, or enabled=false, clears the lock.
  const required =
    config.enabled &&
    config.requiredVersion !== null &&
    isUpdateRequired(installedVersion, config.requiredVersion);
  setState({
    status:          required ? 'required' : 'ok',
    installedVersion,
    requiredVersion: config.requiredVersion,
    storeUrl:        config.storeUrl,
    message:         config.message,
  });
}

function handleFailure(error: unknown) {
  console.warn('App version check failed', error);
  // A confirmed mandatory update stays up; otherwise let the user in and retry.
  if (state.status !== 'required') {
    setState({ status: 'ok', installedVersion: DeviceInfo.getVersion() });
  }
  scheduleRetry();
}

async function runCheck() {
  try {
    applyConfig(await withTimeout(fetchRequiredAppVersion(), FETCH_TIMEOUT_MS));
  } catch (error) {
    handleFailure(error);
  }
}

/** Deduplicated: concurrent callers share one request. */
export function checkForUpdate({ force = false }: { force?: boolean } = {}): Promise<void> {
  if (!isFirebaseConfigured()) {
    if (state.status === 'checking') setState({ status: 'ok' });
    return Promise.resolve();
  }
  if (inFlight) return inFlight;
  if (!force && state.status !== 'required' && Date.now() - lastSuccessAt < RECHECK_MIN_INTERVAL_MS) {
    return Promise.resolve();
  }
  inFlight = runCheck().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Live listener on `/hanumanchalisaandbhakti`: editing the version in Firebase locks or
 * unlocks open apps within about a second. checkForUpdate stays as the
 * fallback for foreground returns and failed subscriptions.
 */
export function startAppUpdateListener(): () => void {
  stopAppUpdateListener();
  if (!isFirebaseConfigured()) {
    setState({ status: 'ok' });
    return stopAppUpdateListener;
  }
  try {
    unsubscribe = subscribeRequiredAppVersion(applyConfig, handleFailure);
  } catch (error) {
    handleFailure(error);
  }
  return stopAppUpdateListener;
}

export function stopAppUpdateListener() {
  unsubscribe?.();
  unsubscribe = null;
}

/** Test helper: resets module-level timers/state. */
export function resetAppUpdateState() {
  stopAppUpdateListener();
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  retryAttempt = 0;
  inFlight = null;
  lastSuccessAt = 0;
  state = INITIAL_STATE;
  listeners.forEach(listener => listener());
}
