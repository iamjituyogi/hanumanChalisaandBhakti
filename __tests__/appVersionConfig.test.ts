import { parseAppVersionConfig } from '../src/services/appVersion';

test('reads the console keys (appVersion / appUrl)', () => {
  const c = parseAppVersionConfig({ appVersion: '1.0.2', appUrl: 'https://play.google.com/store/apps/details?id=x' });
  expect(c.requiredVersion).toBe('1.0.2');
  expect(c.storeUrl).toBe('https://play.google.com/store/apps/details?id=x');
});

test('a comma typo in the version is read as a dot', () => {
  expect(parseAppVersionConfig({ appVersion: '1.0,2' }).requiredVersion).toBe('1.0.2');
});

test('non-store links are ignored (modal falls back to the Play listing)', () => {
  expect(parseAppVersionConfig({ appVersion: '1.1', appUrl: 'https://www.playstore.com' }).storeUrl).toBeNull();
});

test('missing data never locks the app', () => {
  expect(parseAppVersionConfig(null).requiredVersion).toBeNull();
});
