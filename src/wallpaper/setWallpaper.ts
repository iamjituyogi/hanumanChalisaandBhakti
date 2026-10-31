import { Image, ImageSourcePropType, NativeModules, Platform } from 'react-native';
import DeviceWallpaper from 'react-native-device-wallpaper-manager/js/NativeDeviceWallpaper';

export type WallpaperTarget = 'system' | 'lock' | 'both';

/**
 * Builds a phone-sized wallpaper (full-width image + blurred fill) natively and returns
 * a file:// URI. Handles Metro http URLs (debug) and drawable resource names (release).
 */
async function toScreenFittedUri(source: ImageSourcePropType): Promise<string> {
  const uri = Image.resolveAssetSource(source)?.uri;
  if (!uri) {
    throw new Error('Image not found');
  }
  return NativeModules.WallpaperAsset.prepareForScreen(uri);
}

export const wallpaperSupported = Platform.OS === 'android' && !!DeviceWallpaper;

export async function applyWallpaper(source: ImageSourcePropType, target: WallpaperTarget): Promise<void> {
  if (!DeviceWallpaper) {
    throw new Error('Wallpaper module unavailable');
  }
  const uri = await toScreenFittedUri(source);
  await DeviceWallpaper.setWallpaper(uri, target);
}

/**
 * Some launchers (One UI) jump to the home screen right after the wallpaper changes, so the user
 * can miss the success screen. We remember the last un-acknowledged success and replay it when
 * the app comes back to the foreground.
 */
export type PendingSuccess = { wallpaperId: string; target: WallpaperTarget };
let pending: PendingSuccess | null = null;
export const pendingSuccess = {
  set: (p: PendingSuccess) => {
    pending = p;
  },
  get: () => pending,
  clear: () => {
    pending = null;
  },
};
