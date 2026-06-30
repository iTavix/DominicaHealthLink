/**
 * Grant a role custom claim to a Firebase user.
 *
 * This is how you bootstrap the FIRST administrator and assign roles securely.
 * The claim is set server-side and is what the Firestore rules trust — it cannot
 * be forged from the browser.
 *
 * Setup (run inside the scripts/ folder):
 *   1. Firebase console → Project settings → Service accounts → "Generate new private key"
 *   2. Save the downloaded file here as  serviceAccountKey.json   (NEVER commit it — see .gitignore)
 *   3. npm install firebase-admin
 *
 * Usage:
 *   node set-admin-claim.js you@example.com admin
 *   node set-admin-claim.js colleague@example.com operator
 *
 * The user must sign OUT and back IN (or refresh their ID token) for the new role to take effect.
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || 'admin';
  if (!email || (role !== 'admin' && role !== 'operator')) {
    console.error('Usage: node set-admin-claim.js <email> <admin|operator>');
    process.exit(1);
  }
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role });
  console.log(`OK — ${email} (uid ${user.uid}) is now role="${role}".`);
  console.log('The user must sign out and back in for the new role to apply.');
  process.exit(0);
}

main().catch((err) => { console.error('Failed:', err.message || err); process.exit(1); });
