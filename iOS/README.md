# iOS waitlist

A static prelaunch page at `https://sudoku42.com/iOS/`. No build step, cookies, analytics SDK, or mailing platform. Joining records consent to an iOS launch email. Sending that email is a manual follow-up; this change does not send email or verify email ownership.

## Publish

1. In `../../function/functions`, run `npm run lint` and `npm test`.
2. From `../../function`, deploy only these functions:
   ```sh
   npx firebase deploy --only functions:iosWaitlist,functions:pruneIosWaitlistRateLimits --project sudoku42xyz
   ```
   Firebase's billing-enabled plan and Cloud Scheduler are required for these functions. This does not require an Apple developer membership.
3. Confirm the deployed `iosWaitlist` URL matches `endpoint` in `app.js`. It uses the existing `sudoku42xyz` Realtime Database and region `us-central1`.
4. Publish the web repository through its existing GitHub Pages workflow. Deploy the backend first so signups work immediately.
5. Submit a real signup from the deployed page, confirm a single record in Firebase, then remove the test record. Check a repeated signup leaves the original record unchanged. Unit/browser checks do not replace this live smoke test.

No production deployment is included in the implementation.

## Data and campaign

- `/iosWaitlist/{sha256(normalizedEmail)}` holds `email`, `createdAt` (milliseconds), `source`, and `consentVersion`. Transactions prevent duplicate entries and preserve original consent/source. Existing and new signups receive the same response.
- Existing database rules deny client reads/writes to both waitlist paths. Admin SDK writes happen only on the backend. Do not add public read access for counts.
- Share links use `utm_source=friend&utm_campaign=ios_waitlist`; the recorded `source` lets you compare direct and shared signups. No personal referral IDs or public signup counts are used.
- `/iosWaitlistRateLimits/{UTC-day}/{dailyIpHash}` caps each IP at 10 valid attempts per hour. A scheduled function prunes old daily buckets, retaining records for less than three days. Max instances bounds scaling, but this is basic abuse protection, not a CAPTCHA or a hard billing cap.
- Email addresses are unverified. Before growing this into an ongoing email campaign, add a transactional email service and double opt-in.
- Handle removal requests sent to `manuel@sudoku42.com` by deleting the matching normalized-email hash. Delete the list after the launch notification or cancellation, as stated in the privacy page.

## Local preview

From the web repository, run `python3 -m http.server 8000` and open `http://localhost:8000/iOS/`. Layout and sharing work locally; the production endpoint intentionally rejects local-origin signups. Use a mocked endpoint for local interaction tests or the Firebase emulators with a development-only origin configuration. Do not expand production CORS to arbitrary origins.
