# DominicaHealthLink · Setup & Security Guide

The app runs **out of the box in local demo mode** (data only in the browser, no login).
To handle **real data**, you must connect Firebase **and** lock it down. Sections 1–3 connect
it; **section 4 (Security) is mandatory before entering any real data.**

---

## 1. Create the Firebase project
1. <https://console.firebase.google.com> → create a project.
2. **Authentication** → *Get started* → enable **Email/Password** and **Google**.
3. **Firestore Database** → *Create database* → **Production mode** (NOT test mode) → pick a region (e.g. `eur3`).

## 2. Paste the configuration
**Project settings → Your apps → Web (`</>`)**, copy the `firebaseConfig` and paste it into
`index.html` in the `FIREBASE_CONFIG` constant:

```js
const FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:abcdef',
};
```
> The web `apiKey` is **not** a secret — it only identifies the project. Real protection comes
> from the security rules below, never from hiding the key.

## 3. Authorized domains
**Authentication → Settings → Authorized domains** → add the domain you serve the app from
(`localhost` is already there). Required for Google sign-in pop-ups.

---

## 4. Security (do this before real data) 🔒

The role checks inside the app (admin/operator) are **only UI convenience** — a determined user
could bypass client-side code. The **real** boundary is enforced by Firebase.

### 4a. Deploy locked-down Firestore rules
The repo ships `firestore.rules`: deny-by-default, and each user can read/write **only their own**
document (`nurseflow/{uid}`) — nobody else, and no anonymous access.

```bash
npm install -g firebase-tools
firebase login
firebase use your-project        # or: firebase use --add
firebase deploy --only firestore:rules
```
Or paste the contents of `firestore.rules` into **Firestore → Rules → Publish**.

✅ Verify in the **Rules Playground** (Firestore → Rules) that an unauthenticated read of
`nurseflow/anything` is **denied**, and that user A cannot read user B's document.

### 4b. Roles via custom claims (server-trusted)
Roles are stored as a **custom claim** that only your backend can set, so the browser can't forge them.
Bootstrap the first administrator:

```bash
cd scripts
# Firebase console → Project settings → Service accounts → "Generate new private key"
#   save it here as serviceAccountKey.json  (NEVER commit it — it's in .gitignore)
npm install
node set-admin-claim.js you@example.com admin
node set-admin-claim.js colleague@example.com operator
```
The user must **sign out and back in** for the new role to apply. The app reads this claim
(`getIdTokenResult().claims.role`) and the Firestore rules verify `request.auth.token.role`.

> Without a role claim, a signed-in user defaults to **admin of their own private workspace** — which
> is safe because the rules already isolate each user's data. Claims matter when you switch to the
> **shared team model** (next).

### 4c. Shared team workspace
To let the whole HR team share the **same** candidates (instead of separate per-user data), set in
`index.html`:

```js
const SHARED_WORKSPACE = true;
const ORG_ID = 'default';   // one workspace id for your organization
```

Storage then splits into two documents under `organizations/default/data/`:

| Document   | Holds                              | Who can write                 |
|------------|------------------------------------|-------------------------------|
| `cases`    | the candidate caseload (`nurses`)  | any **operator** or **admin** |
| `settings` | base records (agencies, employers, operators, document types) | **admins only** |

The `firestore.rules` already enforce this (operators can work on cases, only admins change base
records). UI preferences (view, language, theme) stay local and are not shared.

**Enable it in this order:** (1) deploy the rules (§4a), (2) bootstrap at least one admin via custom
claim (§4b) — otherwise the shared `settings` document can't be created — then (3) flip
`SHARED_WORKSPACE = true`. In shared mode, a signed-in user **without** a role claim defaults to
*operator* (least privilege); admins are granted only through claims.

> **Concurrency note.** Each document is written as a whole (last-write-wins). For a small team this is
> fine; for many operators editing simultaneously, ask for the per-case-document variant
> (`organizations/{orgId}/cases/{caseId}`), which avoids overwrites.

### 4d. Document file uploads (Firebase Storage)
The "Carica/Upload" button on each document opens a real file picker and attaches the file. To store the
actual bytes in the cloud, enable **Storage**: Firebase console → **Build → Storage → Get started**, then
publish `storage.rules` (Storage → Rules, or `firebase deploy --only storage`). The rules give each user
access only to their own files (or, in shared mode, any operator). Without Storage the app still works —
small files are kept locally for preview; large/shared files need Storage enabled.

### 4e. Enable App Check (recommended)
**App Check** (Firestore → App Check, with reCAPTCHA v3 / Enterprise) blocks requests that don't come
from your real app, mitigating abuse and data scraping even if someone copies the config.

### 4f. Hardening checklist
- [ ] Firestore in **production mode**, rules from `firestore.rules` deployed & tested.
- [ ] Only the auth providers you use are enabled.
- [ ] Authorized domains limited to your real domain(s).
- [ ] First admin bootstrapped via custom claim; operators assigned explicitly.
- [ ] `serviceAccountKey.json` **never** committed (check `.gitignore`).
- [ ] App Check enabled.
- [ ] Serve over **HTTPS** (custom domain or Firebase Hosting), not `file://`.

---

## How data is stored
- Each user has a document `nurseflow/{uid}` holding the whole `appState` (nurses, documents,
  checklists, logs, settings).
- Every change is written to Firestore (debounced) and cached in `localStorage` for offline use.
- On login the state is loaded from the cloud; if none exists it's seeded with the 3 demo profiles.

## Run locally
```bash
python3 -m http.server   # then open http://localhost:8000
```
Opening via `file://` breaks Google pop-up sign-in and App Check — always use http(s).
