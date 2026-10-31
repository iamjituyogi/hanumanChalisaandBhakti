import { compareVersions, isUpdateRequired, isValidStoreUrl, parseVersion } from '../src/utils/appVersion';

test.each([
  ['1.4', '1.5', true],
  ['1.4', '1.4', false],
  ['1.5', '1.4', false],
  ['1.0.9', '1.0.10', true],
  ['1.9', '1.14', true],
])('installed %s vs required %s -> update required: %s', (installed, required, expected) => {
  expect(isUpdateRequired(installed, required)).toBe(expected);
});

test('invalid versions never lock the app', () => {
  expect(isUpdateRequired('1.4', 'abc')).toBe(false);
  expect(compareVersions(null, '1.0')).toBeNull();
  expect(parseVersion('1.2.3.4.5')).toBeNull();
});

test('store URLs are limited to official stores', () => {
  expect(isValidStoreUrl('https://play.google.com/store/apps/details?id=x')).toBe(true);
  expect(isValidStoreUrl('market://details?id=x')).toBe(true);
  expect(isValidStoreUrl('https://evil.example.com/x')).toBe(false);
});
