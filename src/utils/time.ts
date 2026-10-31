/** Formats seconds as mm:ss, or h:mm:ss for an hour or more. Invalid input renders as 00:00. */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Progress ratio between 0 and 1, safe against zero or unknown durations. */
export function progressRatio(position: number, duration: number): number {
  if (!duration || duration <= 0 || !Number.isFinite(position)) {
    return 0;
  }
  return Math.min(1, Math.max(0, position / duration));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
