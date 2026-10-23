/**
 * @file google_apps_script/DriveUploadBridge.gs
 * @description สคริปต์ตัวกลางสำหรับตรวจสอบลิงก์และอัปโหลดรูปถ่ายลงเวลา (อัตราส่วน 3:4) เข้าสู่ Google Drive
 * และคืนค่า Direct URL เพื่อให้ Supabase จัดเก็บเฉพาะ URL เท่านั้น
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'verify';
  var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : '';
  return handleVerifyFolder(folderId);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'upload';
    var folderId = payload.folderId || '';

    if (action === 'verify') {
      return handleVerifyFolder(folderId);
    }

    if (action === 'upload') {
      var base64Data = payload.base64Data || '';
      var fileName = payload.fileName || ('Checkin_' + new Date().getTime() + '.jpg');
      var mimeType = payload.mimeType || 'image/jpeg';

      var folder = getOrCreateTargetFolder(folderId);
      var cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      var decodedBytes = Utilities.base64Decode(cleanBase64);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      var directImageUrl = 'https://lh3.googleusercontent.com/d/' + fileId;

      return createJsonResponse({
        success: true,
        fileId: fileId,
        fileName: fileName,
        url: directImageUrl,
        viewUrl: file.getUrl(),
        message: 'อัปโหลดรูปภาพลง Google Drive สำเร็จ'
      });
    }

    return createJsonResponse({ success: false, message: 'ไม่รู้จักคำสั่ง action ที่ส่งมา' });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: 'เกิดข้อผิดพลาดบน Google Drive Bridge: ' + err.toString()
    });
  }
}

function handleVerifyFolder(folderId) {
  try {
    var folder = getOrCreateTargetFolder(folderId);
    return createJsonResponse({
      success: true,
      folderId: folder.getId(),
      folderName: folder.getName(),
      folderUrl: folder.getUrl(),
      message: 'เชื่อมต่อโฟลเดอร์ "' + folder.getName() + '" บน Google Drive สำเร็จ พร้อมใช้งาน'
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: 'ไม่สามารถเข้าถึงโฟลเดอร์ Google Drive ได้: ' + err.toString()
    });
  }
}

function getOrCreateTargetFolder(folderId) {
  if (folderId && folderId.trim() !== '') {
    var cleanId = extractFolderIdFromInput(folderId.trim());
    return DriveApp.getFolderById(cleanId);
  }
  var defaultFolderName = 'BMA_Checkin_Photos';
  var folders = DriveApp.getFoldersByName(defaultFolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(defaultFolderName);
}

function extractFolderIdFromInput(input) {
  var match = input.match(/[-\w]{25,}/);
  return match ? match[0] : input;
}

function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}