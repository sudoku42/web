# iOS waitlist

A static prelaunch page at `https://sudoku42.com/iOS/`. No build step, cookies, analytics SDK, or mailing platform. Joining records consent to an iOS launch email. Sending that email is a manual follow-up; this change does not send email or verify email ownership.

## Publish

1. In `../../function/functions`, run `npm run lint` and `npm test`.
2. From `../../function`, deploy the waitlist function:
   ```sh
   npx firebase deploy --only functions:waitlist --project sudoku42xyz
   ```
   Firebase's billing-enabled plan is required for this function. This does not require an Apple developer membership.
3. Confirm the deployed `waitlist` URL matches `endpoint` in `app.js`. It uses the existing `sudoku42xyz` Realtime Database and region `us-central1`.
4. Publish the web repository through its existing GitHub Pages workflow. Deploy the backend first so signups work immediately.
5. Submit a real signup from the deployed page, confirm a single record in Firebase, then remove the test record. Check a repeated signup leaves the original record unchanged. Unit/browser checks do not replace this live smoke test.

No production deployment is included in the implementation.

The endpoint uses Firebase `onCall`. Requests use `{ "data": { "email": "you@example.com", "source": "direct" } }`; successful responses use `{ "result": { "ok": true } }`. Firebase handles the request protocol and error responses. Only string types and lengths are checked: email must be non-empty and at most 254 characters; optional source must be at most 40 characters. Email format is not validated. There is no custom origin check, honeypot, or IP rate limiter. The page uses `fetch`, without a Firebase browser SDK.

## Data and campaign

- `/ios-waitlist/{sha256(normalizedEmail)}` holds `email`, `createdAt` (milliseconds), `source`, `deviceFamily`, and `consentVersion`. The browser derives `deviceFamily` as `iphone`, `ipad`, `android`, `desktop`, or `other`; the function stores the supplied category without enforcing a fixed list, but limits it to a string of 40 characters. Do not store raw user agents or IP addresses. Transactions prevent duplicate entries and preserve original consent/source. Existing and new signups receive the same response.
- Existing database rules deny client reads/writes to the waitlist path. Admin SDK writes happen only on the backend. Do not add public read access for counts.
- Share links use `utm_source=friend&utm_campaign=ios_waitlist`; the recorded `source` lets you compare direct and shared signups. No personal referral IDs or public signup counts are used.
- Email addresses are unverified. Before growing this into an ongoing email campaign, add a transactional email service and double opt-in.
- Handle removal requests sent to `manuel@sudoku42.com` by deleting the matching normalized-email hash. Delete the list after the launch notification or cancellation, as stated in the privacy page.

## Local preview

From the web repository, run `python3 -m http.server 8000` and open `http://localhost:8000/iOS/`. Layout and sharing work locally; the callable endpoint uses Firebase’s default CORS handling. Use a mocked endpoint or the Firebase emulators for local signup tests, to avoid saving preview submissions in the production list.
