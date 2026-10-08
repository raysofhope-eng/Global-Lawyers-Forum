/**
 * Global Lawyers Forum - Membership Application backend.
 *
 * Deploy this inside the Google Sheet owned by globallawyersforum@gmail.com.
 * It receives the website form, stores the applicant photo in Google Drive,
 * logs the full record in Google Sheets, and sends styled confirmation emails.
 */

var SHEET_NAME = 'Applications';
var SPREADSHEET_ID = '19n4aVEd_zYQCrC6GVR8oYeJNaQPxVXpNG3oCg2W0rJM';
var DRIVE_FOLDER_NAME = 'GLF Membership Photos';
var REGISTRAR_EMAIL = 'globallawyersforum@gmail.com';
var ORG_NAME = 'Global Lawyers Forum';
var TAGLINE = 'Justice Without Borders';

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

    var ref = makeReference_();
    var picture = { url: '', name: '', id: '', folderUrl: '' };
    if (data.pictureBase64) {
      picture = savePicture(data, ref);
    }

    var entry = logSubmission(data, picture, ref);
    emailApplicant(data, ref);
    emailRegistrar(data, picture, ref, entry);
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

function makeReference_() {
  return 'GLF-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'UTC', 'yyyyMMdd-HHmmss');
}

function clean_(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function esc_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dash_(value) {
  return value ? value : '-';
}

function getOrCreateFolder_(name, parent) {
  var scope = parent || DriveApp;
  var folders = scope.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return scope.createFolder(name);
}

function savePicture(data, ref) {
  var base64 = String(data.pictureBase64).split(',').pop();
  var bytes = Utilities.base64Decode(base64);
  var ext = data.pictureType && data.pictureType.indexOf('png') !== -1 ? '.png' : '.jpg';
  var label = clean_(data.name) + ' - ' + clean_(data.email);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'UTC', 'yyyy-MM-dd HH-mm-ss');
  var fileName = ref + ' - ' + label + ' - ' + stamp + ext;

  var rootFolder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
  var blob = Utilities.newBlob(bytes, data.pictureType || 'image/jpeg', fileName);
  var file = rootFolder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // Some Google Workspace policies block public link sharing; the file is still saved.
  }

  return {
    url: file.getUrl(),
    name: file.getName(),
    id: file.getId(),
    folderUrl: rootFolder.getUrl()
  };
}

function logSubmission(data, picture, ref) {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No spreadsheet is attached. Set SPREADSHEET_ID to your GLF Membership Applications spreadsheet ID.');
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Reference', 'Enquiry Type', 'Name', 'Address', 'Cell No.', 'Email',
      'CNIC / Identity', 'Passport No.', 'License of the Bar',
      'Parent Bar Membership', 'Message', 'Picture File Name', 'Picture File ID',
      'Picture URL', 'Image Folder', 'Submitted From'
    ]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(), ref, data.intent || 'membership', data.name, data.address, data.cell,
    data.email, data.cnic, data.passport, data.barLicense, data.parentBar,
    data.message || '', picture.name || '', picture.id || '', picture.url || '',
    picture.folderUrl || '', data.pageUrl || ''
  ]);

  var row = sheet.getLastRow();
  return {
    row: row,
    url: ss.getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + row + ':Q' + row
  };
}

function detailsTable_(data, picture, ref) {
  var rows = [
    ['Reference', ref],
    ['Name', data.name],
    ['Address', data.address],
    ['Cell No.', data.cell],
    ['Email', data.email],
    ['CNIC / Identity', data.cnic],
    ['Passport No.', dash_(data.passport)],
    ['License of the Bar', data.barLicense],
    ['Parent Bar Membership', data.parentBar],
    ['Message', dash_(data.message)]
  ];

  if (picture && picture.url) {
    rows.push(['Photo File', picture.name]);
    rows.push(['Photo Link', '<a href="' + esc_(picture.url) + '">Open in Google Drive</a>']);
  }

  return rows.map(function (row) {
    var value = String(row[1]).indexOf('<a ') === 0 ? row[1] : esc_(row[1]);
    return '<tr>' +
      '<th style="text-align:left;padding:10px 12px;background:#f6f1e7;border-bottom:1px solid #eadfca;color:#152b3d;width:34%;font-size:13px;">' + esc_(row[0]) + '</th>' +
      '<td style="padding:10px 12px;border-bottom:1px solid #eadfca;color:#263746;font-size:13px;">' + value + '</td>' +
      '</tr>';
  }).join('');
}

function emailShell_(title, intro, tableHtml, actions, ctaText) {
  if (actions && !Array.isArray(actions)) {
    actions = [{ url: actions, text: ctaText || 'Open' }];
  }
  var cta = '';
  if (actions && actions.length) {
    cta = '<p style="margin:24px 0 0;">' + actions.filter(function (action) {
      return action && action.url;
    }).map(function (action) {
      return '<a href="' + esc_(action.url) + '" style="display:inline-block;background:#c6a15b;color:#091723;text-decoration:none;padding:12px 18px;border-radius:4px;font-weight:700;margin:0 8px 8px 0;">' + esc_(action.text || 'Open') + '</a>';
    }).join('') + '</p>';
  }

  return '<div style="margin:0;padding:0;background:#f4f0e8;font-family:Arial,Helvetica,sans-serif;">' +
    '<div style="max-width:680px;margin:0 auto;padding:28px 14px;">' +
    '<div style="background:#0a1723;color:#fff;padding:24px 26px;border-radius:8px 8px 0 0;">' +
    '<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#d9bd78;">' + esc_(ORG_NAME) + '</div>' +
    '<h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:700;">' + esc_(title) + '</h1>' +
    '<p style="margin:8px 0 0;color:#d7e0e7;font-size:14px;">' + esc_(TAGLINE) + '</p>' +
    '</div>' +
    '<div style="background:#ffffff;padding:26px;border:1px solid #eadfca;border-top:0;border-radius:0 0 8px 8px;">' +
    '<p style="margin:0 0 18px;color:#263746;font-size:15px;line-height:1.6;">' + intro + '</p>' +
    '<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;border:1px solid #eadfca;border-bottom:0;">' + tableHtml + '</table>' +
    cta +
    '<p style="margin:24px 0 0;color:#5c6b76;font-size:13px;line-height:1.6;">With regards,<br>The Registrar<br>' + esc_(ORG_NAME) + '</p>' +
    '</div></div></div>';
}

function emailApplicant(data, ref) {
  var isRegistrar = data.intent === 'registrar';
  var subject = ORG_NAME + ' - ' + (isRegistrar ? 'We received your enquiry' : 'Application received') + ' - ' + ref;
  var body =
    'Dear ' + data.name + ',\n\n' +
    (isRegistrar
      ? 'Thank you for contacting the Office of the Registrar at ' + ORG_NAME + '. We have received your enquiry and a member of our team will respond shortly.\n\n'
      : 'Thank you for applying for membership with ' + ORG_NAME + '. Your application has been received and is now under review by the Office of the Registrar.\n\n') +
    'Reference: ' + ref + '\n' +
    'Name: ' + data.name + '\n' +
    'Address: ' + data.address + '\n' +
    'Cell No.: ' + data.cell + '\n' +
    'Email: ' + data.email + '\n' +
    'CNIC / Identity: ' + data.cnic + '\n' +
    'Passport No.: ' + dash_(data.passport) + '\n' +
    'License of the Bar: ' + data.barLicense + '\n' +
    'Parent Bar Membership: ' + data.parentBar + '\n\n' +
    'If any of this needs correcting, simply reply to this email.\n\n' +
    'With regards,\nThe Registrar\n' + ORG_NAME + ' - ' + TAGLINE;

  var intro = 'Dear ' + esc_(data.name) + ',<br><br>' +
    (isRegistrar
      ? 'Thank you for contacting the Office of the Registrar at ' + esc_(ORG_NAME) + '. We have received your enquiry and a member of our team will respond shortly.'
      : 'Thank you for applying for membership with ' + esc_(ORG_NAME) + '. Your application has been received and is now under review by the Office of the Registrar.') +
    '<br><br>If any detail needs correcting, simply reply to this email.';

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
    htmlBody: emailShell_(isRegistrar ? 'Registrar enquiry received' : 'Membership application received', intro, detailsTable_(data, null, ref))
  });
}

function emailRegistrar(data, picture, ref, entry) {
  var subject = 'New ' + (data.intent === 'registrar' ? 'registrar enquiry' : 'membership application') + ' - ' + data.name + ' - ' + ref;
  var body =
    'A new submission was received on the website.\n\n' +
    'Reference: ' + ref + '\n' +
    'Name: ' + data.name + '\n' +
    'Address: ' + data.address + '\n' +
    'Cell No.: ' + data.cell + '\n' +
    'Email: ' + data.email + '\n' +
    'CNIC / Identity: ' + data.cnic + '\n' +
    'Passport No.: ' + dash_(data.passport) + '\n' +
    'License of the Bar: ' + data.barLicense + '\n' +
    'Parent Bar Membership: ' + data.parentBar + '\n' +
    'Message: ' + dash_(data.message) + '\n' +
    'Picture file: ' + dash_(picture.name) + '\n' +
    'Picture file ID: ' + dash_(picture.id) + '\n' +
    'Picture: ' + dash_(picture.url) + '\n' +
    'Sheet entry: ' + dash_(entry && entry.url) + '\n' +
    'Submitted from: ' + dash_(data.pageUrl) + '\n';

  var intro = 'A new website submission has been received. The applicant photo has been saved to Google Drive and the full record has been added to the Applications sheet.';

  MailApp.sendEmail({
    to: REGISTRAR_EMAIL,
    subject: subject,
    body: body,
    htmlBody: emailShell_('New website submission', intro, detailsTable_(data, picture, ref), [
      { url: picture.url, text: 'View applicant photo' },
      { url: picture.folderUrl, text: 'View image in Drive' },
      { url: entry && entry.url, text: 'View applicant entry' }
    ])
  });
}
