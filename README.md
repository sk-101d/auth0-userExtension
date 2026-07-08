# auth0-extension

A **user custom extension** for App Studio that integrates the [Auth0](https://auth0.com) SDK
([`react-native-auth0`](https://github.com/auth0/react-native-auth0) **v5**).

Ported from **[101digital/auth0-react-native-app](https://github.com/101digital/auth0-react-native-app)**
(`frontend/`). That app drives Auth0 through the `useAuth0()` React hook; extension functions are
**headless** (plain `input -> output`, no React), so the same flows are implemented here with the
imperative `Auth0` **client class**:

| App (hook) | Extension (class API) |
| --- | --- |
| `useAuth0().sendSMSCode` | `auth0.auth.passwordlessWithSMS` |
| `useAuth0().authorizeWithSMS` | `auth0.auth.loginWithSMS` |
| `useAuth0().authorize` | `auth0.webAuth.authorize` |
| `useAuth0().getCredentials` / `hasValidCredentials` / `clearCredentials` | `auth0.credentialsManager.*` |

The hook auto-persists tokens; the class API does not, so we call
`credentialsManager.saveCredentials()` after a successful login.

The App Studio custom-extension flow pulls this repo, overlays the generated app on top, keeps
`src/extensions/`, merges `package.json` dependencies, and pushes a review branch.

## Contents

| Path | Purpose |
| --- | --- |
| `src/extensions/config.ts` | Auth0 tenant settings (mirrors the source app's `config.js`). |
| `src/extensions/Auth0Functions.ts` | Custom functions calling `react-native-auth0` v5. |
| `src/extensions/index.ts` | `CustomFunctionRegistry` + `executeCustomFunction` the app resolves at runtime. |
| `package.json` | Declares `react-native-auth0` `^5.7.0` (merged into the app). |

## Flows

**Mobile · Native — passwordless SMS OTP** (the primary flow): enter mobile number → Auth0 texts a
one-time code → verify it in-app. No password, no hosted browser.

```
sendPhoneOtp({ phone })   -> Auth0/Twilio SMS
verifyPhoneOtp({ phone, code })  -> tokens (creates the user on first verify, logs in after)
```

**Mobile · Universal Login** — `login()` opens Auth0's hosted page for the phone-as-identifier
connection (`phoneConnection`).

## Functions

| Function | Input | Output | Notes |
| --- | --- | --- | --- |
| `Auth0Functions.sendPhoneOtp` | `{ phone }` | `{ status }` | `'sent'` / `'failed'` — **string routing field**. |
| `Auth0Functions.verifyPhoneOtp` | `{ phone, code }` | `{ status, accessToken, userId, email }` | `'authenticated'` / `'failed'`. Persists credentials. |
| `Auth0Functions.login` | `{ signup?, connection? }` | `{ status, accessToken, userId, email }` | Universal Login. `'authenticated'` / `'failed'`. |
| `Auth0Functions.logout` | `{}` | `{ success }` | `clearCredentials()` (local only, no browser). |
| `Auth0Functions.getCredentials` | `{}` | `{ hasValidCredentials, accessToken }` | Silent check for an existing valid session. |

`status` is a string because response-based routing matches string branch cases
(`${$ext.auth0.verifyPhoneOtp.status = 'authenticated'}`) — a boolean would never match `case 'authenticated'`.

## Declaring it in the app definition

```ts
const auth0 = app.useExtension({
  name: "auth0",
  functions: [
    { name: "sendPhoneOtp",   input: { phone: "string" }, output: { status: "string" } },
    { name: "verifyPhoneOtp", input: { phone: "string", code: "string" },
      output: { status: "string", accessToken: "string", userId: "string", email: "string" } },
    { name: "login", input: { signup: "boolean", connection: "string" },
      output: { status: "string", accessToken: "string", userId: "string", email: "string" } },
    { name: "logout", input: {}, output: { success: "boolean" } },
    { name: "getCredentials", input: {}, output: { hasValidCredentials: "boolean", accessToken: "string" } },
  ],
});
```

Trigger `auth0.verifyPhoneOtp` from a button and route on `$ext.auth0.verifyPhoneOtp.status`.

## Configuration (`src/extensions/config.ts`)

Defaults mirror the source app's Auth0 **Native** tenant (public values — no client secret in this
flow). Override any via env (`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_AUDIENCE`, `AUTH0_SCOPE`,
`AUTH0_CONNECTION`, `AUTH0_PHONE_CONNECTION`).

## Native / Auth0 setup

The Auth0 **domain** must also be set in the native projects so the login redirect is captured:

- **Android** — `android/app/build.gradle`, `defaultConfig.manifestPlaceholders`:
  ```gradle
  auth0Domain: "your-tenant.us.auth0.com",
  auth0Scheme: "${applicationId}.auth0"
  ```
- **iOS** — `Info.plist` URL scheme `$(PRODUCT_BUNDLE_IDENTIFIER).auth0`; run `pod install`.

**Auth0 dashboard**
- Add the callback/logout URLs `<bundleId>.auth0://<domain>/{ios|android}/<bundleId>/callback`.
- **Passwordless SMS**: enable **Authentication → Passwordless → SMS** (Twilio), and tick
  **Applications → your app → Advanced → Grant Types → Passwordless OTP** (without it, verify returns
  *"Grant type not allowed"*). Twilio trial only texts verified numbers.

See the [react-native-auth0 docs](https://github.com/auth0/react-native-auth0) for full setup.
