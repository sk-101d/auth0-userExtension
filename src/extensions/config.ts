// Auth0 tenant configuration — mirrors the 101digital/auth0-react-native-app frontend/src/config.js.
// For a NATIVE application these values are public (no client secret in this flow), so they are safe
// to ship in the app bundle. Override any of them via env (react-native-config / an inline-env babel
// plugin) without editing this file.
//
// NOTE: the Auth0 *domain* must ALSO be set in the native projects so the login callback is captured:
//   - Android: android/app/build.gradle  -> defaultConfig.manifestPlaceholders.auth0Domain
//   - iOS:     ios/<App>/Info.plist       -> the CFBundleURLSchemes entry (<bundleId>.auth0)
// See README.md for the exact lines.
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN ?? 'dev-nxpgkiwoj254xkik.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID ?? '41SfLu62bc0QtB0MyZ3eKzmsB71ufVch',
  // API identifier from Auth0 -> APIs (must match the backend's AUTH0_AUDIENCE). Empty = omit.
  audience: process.env.AUTH0_AUDIENCE ?? '',
  // offline_access enables refresh tokens so sessions survive app restarts.
  scope: process.env.AUTH0_SCOPE ?? 'openid profile email offline_access',
  // Default DB connection (email+password). Used if a `login` call passes no connection.
  connection: process.env.AUTH0_CONNECTION ?? 'Username-Password-Authentication',
  // Phone-as-identifier DB connection used by the Universal-Login phone method.
  phoneConnection: process.env.AUTH0_PHONE_CONNECTION ?? 'phone-password',
};
