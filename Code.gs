/**
 * Global Lawyers Forum — Membership Application backend.
 *
 * Deploy this inside a Google Sheet that lives in the
 * globallawyersforum@gmail.com Google account (see
 * SETUP-INSTRUCTIONS.md for the exact steps). It:
 *   1. Receives the membership/registrar form submitted from the
 *      website (membership.html).
 *   2. Saves the applicant's photo to Google Drive, in a
 *      per-applicant subfolder named with their name and email
 *      (GLF Membership Photos / <Name> — <email> / ...) so files
 *      never get mixed up between applicants.
 *   3. Logs the submission as a new row in this spreadsheet.
 *   4. Emails the applicant a confirmation, sent from
 *      globallawyersforum@gmail.com (the account this script is
 *      deployed under).
 *   5. Emails the registrar (globallawyersforum@gmail.com) a
 *      notification with the applicant's details and a link to
 *      the uploaded photo.
 */

var SHEET_NAME = 'Applications';
var DRIVE_FOLDER_NAME = 'GLF Membership Photos';
var REGISTRAR_EMAIL = 'globallawyersforum@gmail.com';
var ORG_NAME = 'Global Lawyers Forum';

function doPost(e) {
  var result = { ok: true };
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received.');
    }
    var data = JSON.parse(e.postData.contents);

    if (!data.name || !data.email) {
      throw new Error('Name and email are required.');
    }

    var pictureUrl = '';
    if (data.pictureBase64) {
      pictureUrl = savePicture(data);
    }

    logSubmission(data, pictureUrl);
    emailApplicant(data);
    emailRegistrar(data, pictureUrl);
  } catch (err) {
    result = { ok: false, error: String(err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'GLF membership form endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder_(name, parent) {
  var scope = parent || DriveApp;
  var folders = scope.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return scope.createFolder(name);
}

// Every applicant gets their own subfolder, named with their email so
// submissions are easy to find and never get mixed up between applicants:
//   GLF Membership Photos / <Name> — <email> / <Name> — <email> — <timestamp>.jpg
function savePicture(data) {
  var base64 = String(data.pictureBase64).split(',').pop();
  var bytes = Utilities.base64Decode(base64);
  var ext = (data.pictureType && data.pictureType.indexOf('png') !== -1) ? '.png' : '.jpg';
  var label = data.name + ' — ' + data.email;
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'UTC', 'yyyy-MM-dd HH-mm-ss');
  var fileName = data.pictureName || (label + ' — ' + stamp + ext);

  var rootFolder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
  var applicantFolder = getOrCreateFolder_(label, rootFolder);

  var blob = Utilities.newBlob(bytes, data.pictureType || 'image/jpeg', fileName);
  var file = applicantFolder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // sharing restrictions on some Workspace domains — file still saved, just not link-shared
  }
  return file.getUrl();
}

function logSubmission(data, pictureUrl) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Enquiry Type', 'Name', 'Address', 'Cell No.', 'Email',
      'CNIC / Identity', 'Passport No.', 'License of the Bar',
      'Parent Bar Membership', 'Message', 'Picture'
    ]);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(), data.intent || 'membership', data.name, data.address, data.cell,
    data.email, data.cnic, data.passport, data.barLicense, data.parentBar,
    data.message || '', pictureUrl
  ]);
}

function emailApplicant(data) {
  var isRegistrar = data.intent === 'registrar';
  var subject = ORG_NAME + ' — ' + (isRegistrar ? 'We received your enquiry' : 'Application received');
  var body =
    'Dear ' + data.name + ',\n\n' +
    (isRegistrar
      ? 'Thank you for contacting the Office of the Registrar at ' + ORG_NAME + '. We have received your enquiry and a member of our team will respond shortly.\n\n'
      : 'Thank you for applying for membership with ' + ORG_NAME + '. Your application has been received and is now under review by the Office of the Registrar.\n\n') +
    'Summary of what you submitted:\n' +
    '  Name: ' + data.name + '\n' +
    '  Address: ' + data.address + '\n' +
    '  Cell No.: ' + data.cell + '\n' +
    '  Email: ' + data.email + '\n' +
    '  CNIC / Identity: ' + data.cnic + '\n' +
    '  Passport No.: ' + (data.passport || '—') + '\n' +
    '  License of the Bar: ' + data.barLicense + '\n' +
    '  Parent Bar Membership: ' + data.parentBar + '\n\n' +
    'If any of this needs correcting, simply reply to this email.\n\n' +
    'With regards,\n' +
    'The Registrar\n' +
    ORG_NAME + ' — Justice Without Borders';

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body
  });
}

function emailRegistrar(data, pictureUrl) {
  var subject = 'New ' + (data.intent === 'registrar' ? 'registrar enquiry' : 'membership application') + ' — ' + data.name;
  var body =
    'A new submission was received on the website.\n\n' +
    'Name: ' + data.name + '\n' +
    'Address: ' + data.address + '\n' +
    'Cell No.: ' + data.cell + '\n' +
    'Email: ' + data.email + '\n' +
    'CNIC / Identity: ' + data.cnic + '\n' +
    'Passport No.: ' + (data.passport || '—') + '\n' +
    'License of the Bar: ' + data.barLicense + '\n' +
    'Parent Bar Membership: ' + data.parentBar + '\n' +
    'Message: ' + (data.message || '—') + '\n' +
    'Picture: ' + (pictureUrl || '—') + '\n' +
    'Submitted from: ' + (data.pageUrl || '—') + '\n';

  MailApp.sendEmail({
    to: REGISTRAR_EMAIL,
    subject: subject,
    body: body
  });
}
