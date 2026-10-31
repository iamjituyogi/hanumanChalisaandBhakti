/**
 * Version helpers for the force-update check (see services/appUpdate.ts).
 * Pure functions — no React Native imports — so they are easy to unit test.
 */

/** Parses "1.0.10" into [1, 0, 10]. Returns null for anything that isn't dotted non-negative integers. */
export function parseVersion(value: unknown): number[] | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d+(\.\d+){0,3}$/.test(trimmed)) return null;
  return trimmed.split('.').map(Number);
}

/**
 * Numeric segment comparison (1.0.9 < 1.0.10, 1.9 < 1.14); missing segments count as 0.
 * Returns -1 / 0 / 1, or null when either side isn't a valid version.
 */
export function compareVersions(a: unknown, b: unknown): -1 | 0 | 1 | null {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return null;
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

/** True only when both versions are valid and installed is strictly older than required. */
export function isUpdateRequired(installed: unknown, required: unknown): boolean {
  return compareVersions(installed, required) === -1;
}

const STORE_HOSTS = ['play.google.com', 'apps.apple.com', 'itunes.apple.com'];

/** Accepts only https links to the official stores, or Android's market:// scheme. */
export function isValidStoreUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const value = url.trim();
  if (/^market:\/\/[^\s]+$/i.test(value)) return true;
  const match = /^https:\/\/([^/?#\s]+)(?:[/?#]\S*)?$/i.exec(value);
  return !!match && STORE_HOSTS.includes(match[1].toLowerCase());
}
