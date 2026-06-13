# Firebase hardening checklist (Session 4.3)

Pre-launch security pass. **All of this is console work — no code changes.**
Claude Code can't do these for you (they need your Google login), so this file
is the click-by-click guide. Do it once, the week before students arrive.

---

## 1. Confirm Firestore security rules match what the code expects

The app assumes: a student can read/write **only their own** progress doc, and
the teacher account can **read** everyone's.

1. Go to <https://console.firebase.google.com> → your **guitar-class-2fd21**
   project (that's the real project ID — see `firebase-config.js`).
2. **Build → Firestore Database → Rules** tab.
3. Confirm the rules read exactly like this (this is the same block documented in
   `index.html` at the bottom):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /progress/{userId} {
         allow read, write: if request.auth != null
           && request.auth.uid == userId;
         allow read: if request.auth != null
           && request.auth.token.email == "jhoffman@seq.org";
       }
     }
   }
   ```

4. ⚠️ If the rules still say `allow read, write: if true;` (the "test mode"
   default), the database is **wide open** — anyone could read/erase all student
   data. Replace it with the block above and click **Publish**.
5. Sanity check the teacher email. The dashboard gate in the app uses the teacher
   account — make sure the email on line `request.auth.token.email == "..."`
   matches the Google account you actually sign in with as the teacher.

---

## 2. Restrict the web API key to your site's domain

Right now the API key in `firebase-config.js` works from anywhere. Lock it to the
live site so a copied key can't be abused.

1. Go to <https://console.cloud.google.com> → pick the **guitar-class-2fd21**
   project (same project as Firebase).
2. **APIs & Services → Credentials**.
3. Find the **Browser key (auto created by Firebase)** → click it.
4. Under **Application restrictions**, choose **Websites** (HTTP referrers).
5. Add these referrers (the site is a GitHub *project* page, so it lives under
   the `/guitar-class/` path, not the domain root):
   - `jhoffmanteacher.github.io/guitar-class/*`
   - `localhost/*`  (so local testing keeps working)
6. **Save.** Changes can take a few minutes to take effect.
7. Test: open the live site in an incognito window, sign in, mark a skill — it
   should still save. Then confirm the key is rejected elsewhere (optional).

> Note: a Firebase web API key is *identifier*, not a secret — referrer
> restriction is the right control, and Firestore rules (step 1) are what
> actually protect the data.

---

## 3. App Check — optional, skip if it adds friction

App Check blocks requests that don't come from your real app. For a class site
behind Google sign-in + the rules above, it's belt-and-suspenders. **Skip it
unless you later see abuse** — it can cause silent failures on school networks
that are annoying to debug.

---

## Done when…

- [x] Firestore rules published and match the block above (not test mode).
      *(verified 2026-06-13 — already locked down, not test mode)*
- [x] Teacher email in the rules matches your real teacher sign-in.
      *(verified 2026-06-13 — `?teacher=true` showed the dashboard, not denied)*
- [x] Browser API key restricted to `jhoffmanteacher.github.io/guitar-class/*` +
      `localhost/*`. *(done 2026-06-13 — `firebaseapp.com/*` auth domain kept)*
- [ ] Signed in on the live site and confirmed progress still saves.
      *(do after ~5 min, incognito — last verification)*
