# Wiring up the membership form — one-time setup

The website (a static GitHub Pages site) cannot send email by itself. `membership.html`'s form is fully built and ready — it just needs a free Google Apps Script backend, deployed **under the globallawyersforum@gmail.com account**, so that confirmation emails genuinely come from that address. This only has to be done once, and takes about ten minutes.

## 1. Create the spreadsheet

1. Sign in to **globallawyersforum@gmail.com** in your browser.
2. Go to [sheets.google.com](https://sheets.google.com) and create a new **blank spreadsheet**.
3. Name it something like `GLF Membership Applications`.

This sheet will fill up automatically with every submission (name, contact details, license info, and a link to their uploaded photo).

## 2. Add the backend script

1. In that spreadsheet, click **Extensions → Apps Script**.
2. Delete anything in the editor and paste in the entire contents of **`Code.gs`** (included alongside this file).
3. Click the **Save** icon (or Ctrl/Cmd+S). Name the project `GLF Membership Backend` if asked.

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `GLF membership form`
   - **Execute as:** `Me (globallawyersforum@gmail.com)`
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. Google will ask you to **authorize** the script (since it sends email and touches Drive/Sheets on your behalf). Click through the consent screen — choose the globallawyersforum@gmail.com account, click **Advanced → Go to GLF Membership Backend (unsafe)** if Google shows the "unverified app" warning (this is expected for a script you wrote yourself and haven't submitted for Google's app-review), then **Allow**.
6. Copy the **Web app URL** shown — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Connect the website to it

1. Open **`form-config.js`** (in the website's files).
2. Replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with the URL you just copied, keeping the quotes:
   ```js
   window.GLF_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Save the file and push/upload it to the GitHub repository (replacing the existing `form-config.js`).

That's it — `membership.html`'s form will now:
- save each applicant's photo to a **"GLF Membership Photos"** folder that appears automatically in Drive,
- log every submission as a new row in your spreadsheet,
- email the applicant a confirmation **from globallawyersforum@gmail.com**,
- and email the registrar (globallawyersforum@gmail.com) a copy of the same details.

## 5. Test it

Open the live site, fill in the membership form yourself with a real email address you can check, attach any photo, and submit. You should see a green confirmation message on the page, a new row in the spreadsheet within a few seconds, and an email arrive shortly after.

## Notes and limits

- A personal Gmail account can send up to **100 emails a day** through Apps Script (MailApp). That's far more than a typical membership page needs; if the Forum ever outgrows it, the same script can be pointed at Google Workspace or a transactional email service instead.
- If you ever need to re-authorize or the URL changes (e.g. you create a new deployment instead of editing the existing one), just repeat step 4 with the new URL — nothing else on the site needs to change.
- The applicant's CNIC and passport numbers are sensitive government ID data. They're stored only in the spreadsheet (visible to whoever you share that sheet with) and the confirmation/notification emails — nowhere else. Consider restricting sharing on the spreadsheet and the Drive folder to people at the Forum who actually need to see applications.
