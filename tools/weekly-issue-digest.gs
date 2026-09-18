/**
 * Weekly email digest of "Report an issue" submissions from the Guitar
 * Class site — reads the `issueReports` Firestore collection (project
 * guitar-class-2fd21) and emails a summary to the teacher. This is a
 * standalone Google Apps Script (script.google.com), NOT part of the
 * site's own codebase — it needs no Cloud Functions / billing upgrade,
 * just a free Apps Script project on Jonathan's Google account with a
 * weekly time-driven trigger.
 *
 * SETUP (one-time, console/UI steps only — can't be done from the repo):
 * 1. https://console.firebase.google.com → guitar-class-2fd21 project →
 *    gear icon → Project settings → Service accounts tab → "Generate new
 *    private key". Downloads a JSON file — treat it like a password
 *    (don't share it, don't commit it to any repo).
 * 2. Open that JSON file. You need two values from it:
 *      client_email — looks like
 *        firebase-adminsdk-xxxxx@guitar-class-2fd21.iam.gserviceaccount.com
 *      private_key  — the "-----BEGIN PRIVATE KEY-----...” block
 * 3. https://script.google.com → New project → paste this whole file in as
 *    Code.gs. Then Project Settings (gear icon, left sidebar) → Script
 *    Properties → Add script property, twice:
 *      SERVICE_ACCOUNT_EMAIL = (the client_email value)
 *      SERVICE_ACCOUNT_KEY   = (the private_key value)
 *    Don't worry about getting this pasted perfectly — it's easy to also
 *    grab the JSON file's surrounding quote marks, and the \n's in the key
 *    paste in as literal two-character "\n" text rather than real line
 *    breaks either way. The code below strips both automatically.
 * 4. Run the `sendWeeklyDigest` function once from the Run menu (▶) to test
 *    it and to authorize the script — it'll ask for permission to send
 *    Gmail and make external requests the first time.
 * 5. Triggers (clock icon, left sidebar) → Add trigger →
 *      Function: sendWeeklyDigest
 *      Event source: Time-driven → Week timer → pick a day + time
 *      (e.g. every Monday, 7am–8am)
 *
 * Behavior: sends one email every run — either listing every issueReports
 * doc created since the last successful run (first run defaults to the
 * last 7 days), or "no new reports this week" if there are none. The
 * last-checked timestamp is stored in Script Properties so a run that's a
 * few minutes early or late never double-counts or drops a report right at
 * the boundary.
 *
 * Troubleshooting: if sendWeeklyDigest errors with a Firestore permission
 * message, check IAM (console.cloud.google.com → IAM & Admin) that the
 * firebase-adminsdk service account still has its default Editor/Firebase-
 * Admin role — Firestore security rules (the ones in index.html) do NOT
 * apply here, since a service-account request is authorized via IAM
 * instead.
 */

const PROJECT_ID = 'guitar-class-2fd21';
const RECIPIENT_EMAIL = 'jhoffman@seq.org';
const LAST_CHECKED_PROP = 'issueReports_lastChecked';

function sendWeeklyDigest() {
  const props = PropertiesService.getScriptProperties();
  const clientEmail = (props.getProperty('SERVICE_ACCOUNT_EMAIL') || '').trim().replace(/^"|"$/g, '');
  // Script Properties stores whatever text you pasted literally: the \n's from
  // the JSON file are still two-character "\n" sequences (not real line
  // breaks, which Utilities.computeRsaSha256Signature needs), and copying the
  // value straight out of the JSON file easily grabs its surrounding quote
  // marks too — strip both defensively rather than relying on a clean paste.
  const privateKey = (props.getProperty('SERVICE_ACCOUNT_KEY') || '').trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Set SERVICE_ACCOUNT_EMAIL and SERVICE_ACCOUNT_KEY in Script Properties first — see the setup notes at the top of this file.');
  }

  const accessToken = getAccessTokenFromServiceAccount_({
    client_email: clientEmail,
    private_key: privateKey,
    scopes: ['https://www.googleapis.com/auth/datastore']
  });

  const now = new Date();
  const lastChecked = props.getProperty(LAST_CHECKED_PROP)
    || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const reports = fetchIssueReportsSince_(accessToken, lastChecked);
  const subject = reports.length
    ? `Guitar site: ${reports.length} new issue report${reports.length === 1 ? '' : 's'}`
    : 'Guitar site: no new issue reports this week';
  const body = formatDigestEmail_(reports, lastChecked, now);

  GmailApp.sendEmail(RECIPIENT_EMAIL, subject, body);
  props.setProperty(LAST_CHECKED_PROP, now.toISOString());
}

function fetchIssueReportsSince_(accessToken, sinceIso) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const query = {
    structuredQuery: {
      from: [{ collectionId: 'issueReports' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'createdAt' },
          op: 'GREATER_THAN',
          value: { timestampValue: sinceIso }
        }
      },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }]
    }
  };
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + accessToken },
    payload: JSON.stringify(query),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Firestore query failed: ' + res.getContentText());
  }
  return JSON.parse(res.getContentText())
    .filter(r => r.document)
    .map(r => fieldsToObject_(r.document.fields));
}

// Firestore REST fields come back typed ({stringValue:"..."} etc.) — flatten
// to plain JS values for the fields this script reads (see app.js's
// submitIssueReport for the full write shape).
function fieldsToObject_(fields) {
  const out = {};
  Object.keys(fields || {}).forEach(key => {
    const v = fields[key];
    if (v.stringValue !== undefined) out[key] = v.stringValue;
    else if (v.integerValue !== undefined) out[key] = parseInt(v.integerValue, 10);
    else if (v.timestampValue !== undefined) out[key] = v.timestampValue;
    else out[key] = null;
  });
  return out;
}

function formatDigestEmail_(reports, sinceIso, now) {
  const range = `${new Date(sinceIso).toLocaleDateString('en-US')} – ${now.toLocaleDateString('en-US')}`;
  if (!reports.length) {
    return `No new "Report an issue" submissions on the guitar site (${range}).`;
  }
  const lines = reports.map((r, i) => [
    `${i + 1}. ${r.createdAt ? new Date(r.createdAt).toLocaleString('en-US') : '(unknown time)'}`,
    `   From: ${r.name || '(no name)'} <${r.email || '(no email)'}>`,
    `   Location: ${r.location || '(unknown)'}`,
    `   Message: ${r.message || ''}`,
    ''
  ].join('\n'));
  return `${reports.length} new issue report${reports.length === 1 ? '' : 's'} on the guitar site (${range}):\n\n${lines.join('\n')}`;
}

/**
 * Get an OAuth2 access token for a service account (JWT-bearer flow).
 * Adapted from tanaikech's well-known Apps Script sample:
 * https://tanaikech.github.io/2018/12/07/retrieving-access-token-for-service-account-using-google-apps-script/
 */
function getAccessTokenFromServiceAccount_(object) {
  const { private_key, client_email, scopes = [] } = object;
  const url = 'https://www.googleapis.com/oauth2/v4/token';
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = { iss: client_email, scope: scopes.join(' '), aud: url, exp: (now + 3600).toString(), iat: now.toString() };
  const signatureInput = Utilities.base64Encode(JSON.stringify(header)) + '.' + Utilities.base64Encode(JSON.stringify(claim));
  const jwt = signatureInput + '.' + Utilities.base64Encode(Utilities.computeRsaSha256Signature(signatureInput, private_key));
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: { assertion: jwt, grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer' },
    muteHttpExceptions: true
  });
  const parsed = JSON.parse(res.getContentText());
  if (!parsed.access_token) throw new Error('Could not get access token: ' + res.getContentText());
  return parsed.access_token;
}
