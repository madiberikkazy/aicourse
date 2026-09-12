# Google Sheets Integration — Setup Guide
## Trion School AI Vibecoding Course

This file explains how to connect your contact form to a Google Sheet in under 5 minutes.

---

## Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it **"Trion School — Байланыс"** (or anything you prefer).
3. In **Row 1**, add these headers (in order, starting from column A):

| A | B | C | D | E |
|---|---|---|---|---|
| Уақыты | Аты-жөні | Телефон | Email | Хабарлама |

---

## Step 2 — Create a Google Apps Script

1. Inside your Google Sheet, click **Extensions → Apps Script**.
2. Delete the default `myFunction` code.
3. Paste the following code:

```js
const SHEET_NAME = 'Sheet1'; // Change to your sheet tab name if different

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name      || '',
      data.phone     || '',
      data.email     || '',
      data.message   || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: GET handler for testing
function doGet(e) {
  return ContentService
    .createTextOutput('Trion School Sheets Webhook is running ✅')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

4. Click **Save** (Ctrl+S / ⌘+S) — name the project anything, e.g. **"TrionWebhook"**.

---

## Step 3 — Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the ⚙️ gear icon next to **"Select type"** and choose **Web app**.
3. Set the following options:
   - **Description:** `Trion contact form webhook`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. **Grant permissions** when prompted (Google will ask you to allow the script to access your Sheets).
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Step 4 — Paste URL into the website

Open `js/main.js` and find this line near the top:

```js
const SHEETS_WEBHOOK_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Replace `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your actual URL:

```js
const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

Save the file. **Done!** Now every time someone clicks **"Жіберу"**, their data will appear as a new row in your Google Sheet.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Data not appearing in Sheet | Check the Web App URL is correct and that you selected "Anyone" for access. |
| Permission error on deploy | Re-deploy and click "Advanced → Go to (unsafe)" on the Google warning popup. |
| CORS error in browser console | This is expected — `mode: no-cors` is used, so the response is always "opaque". The POST still goes through. |
| Need to update the script | Edit the code in Apps Script → **Deploy → Manage deployments → Edit → Version: New** → Update. |

---

## Firebase Setup (Reminder)

Don't forget to also fill in `js/firebase-config.js` with your Firebase project credentials:

1. [console.firebase.google.com](https://console.firebase.google.com) → Create project → Add Web app
2. Copy the `firebaseConfig` object → paste into `js/firebase-config.js`
3. Enable **Authentication** → Sign-in methods:
   - ✅ **Email/Password**
   - ✅ **Google**
4. In **Google sign-in**, set your **Project support email** (required).

---

*Trion School — AI Vibecoding Course*

