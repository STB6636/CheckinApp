import fs from 'fs';

const filePath = 'assets/js/models/AttendanceModel.js';
let content = fs.readFileSync(filePath, 'utf8');
const isCrlf = content.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

// 1. Watermark todayStr
const targetWatermark = '            const todayStr = UIHelpers.getTodayDateString();';
const repWatermark = '            const todayStr = UIHelpers.getTodayISO();';
if (!content.includes(targetWatermark)) {
    console.error('Target watermark not found');
    process.exit(1);
}
content = content.replace(targetWatermark, repWatermark);

// 2. Add updated_at to getReportRecordsByDateRange select
const targetSelect = "approval_status, created_at')";
const repSelect = "approval_status, created_at, updated_at')";
if (!content.includes(targetSelect)) {
    console.error('Target select not found');
    process.exit(1);
}
content = content.replace(targetSelect, repSelect);

// 3. In #formatReportRow, add created_at, updated_at, status_key
const targetFormatRow = [
'            remark: log?.remark || \'\',',
'            status_category: evalStatus.status_key,'
].join(eol);

const repFormatRow = [
'            remark: log?.remark || \'\',',
'            created_at: log?.created_at || null,',
'            updated_at: log?.updated_at || null,',
'            status_key: evalStatus.status_key,',
'            status_category: evalStatus.status_key,'
].join(eol);

if (!content.includes(targetFormatRow)) {
    console.error('Target format row not found');
    process.exit(1);
}
content = content.replace(targetFormatRow, repFormatRow);

// 4. In submitCheckinOrCheckout:
// 4a. Checkout return (around line 1017)
const targetCheckoutRet = [
'            const dateNotice = isPastDateRecord ? ` (ของวันที่ ${UIHelpers.formatThaiShortDate(activeRegularRecord.work_date)})` : \'\';',
'            return {',
'                success: true,',
'                data,',
'                message: `บันทึกลงเวลาเลิกงานสำเร็จ${dateNotice} เวลา ${effectiveCheckOutTime} น. (สถานะ: ${evalOut.status_label})`',
'            };'
].join(eol);

const repCheckoutRet = [
'            const dateNotice = isPastDateRecord ? ` (ของวันที่ ${UIHelpers.formatThaiShortDate(activeRegularRecord.work_date)})` : \'\';',
'            try {',
'                DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                    action: \'checkin_checkout\',',
'                    id: data?.id || null,',
'                    personnel_id: payload.personnel_id || null,',
'                    timestamp: Date.now()',
'                });',
'            } catch (_) {}',
'            return {',
'                success: true,',
'                data,',
'                message: `บันทึกลงเวลาเลิกงานสำเร็จ${dateNotice} เวลา ${effectiveCheckOutTime} น. (สถานะ: ${evalOut.status_label})`',
'            };'
].join(eol);

if (!content.includes(targetCheckoutRet)) {
    console.error('Target checkout ret not found');
    process.exit(1);
}
content = content.replace(targetCheckoutRet, repCheckoutRet);

// 4b. Overtime return (around line 1117)
const targetOtRet = [
'            if (otError) {',
'                return { success: false, message: \'ไม่สามารถบันทึกลงเวลาปฏิบัติงานนอกเวลาได้: \' + otError.message };',
'            }',
'',
'            return {',
'                success: true,',
'                data: createdOt,',
'                message: `บันทึก "ปฏิบัติงานนอกเวลา" สำเร็จ (${otCheckIn} - ${otCheckOut} น.)`',
'            };'
].join(eol);

const repOtRet = [
'            if (otError) {',
'                return { success: false, message: \'ไม่สามารถบันทึกลงเวลาปฏิบัติงานนอกเวลาได้: \' + otError.message };',
'            }',
'',
'            try {',
'                DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                    action: \'checkin_checkout\',',
'                    id: createdOt?.id || null,',
'                    personnel_id: payload.personnel_id || null,',
'                    timestamp: Date.now()',
'                });',
'            } catch (_) {}',
'            return {',
'                success: true,',
'                data: createdOt,',
'                message: `บันทึก "ปฏิบัติงานนอกเวลา" สำเร็จ (${otCheckIn} - ${otCheckOut} น.)`',
'            };'
].join(eol);

if (!content.includes(targetOtRet)) {
    console.error('Target ot ret not found');
    process.exit(1);
}
content = content.replace(targetOtRet, repOtRet);

// 4c. Single-click return (around line 1221)
const targetSingleRet = [
'            if (error) {',
'                return { success: false, message: \'ไม่สามารถบันทึกลงเวลาได้: \' + error.message };',
'            }',
'',
'            return {',
'                success: true,',
'                data,',
'                message: `บันทึกลงเวลารูปแบบพิเศษสำเร็จ! เข้างาน ${checkInFinal} น. / เลิกงาน ${checkOutFinal} น. (สถานะ: ${evalResult.status_label})`',
'            };'
].join(eol);

const repSingleRet = [
'            if (error) {',
'                return { success: false, message: \'ไม่สามารถบันทึกลงเวลาได้: \' + error.message };',
'            }',
'',
'            try {',
'                DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                    action: \'checkin_checkout\',',
'                    id: data?.id || null,',
'                    personnel_id: payload.personnel_id || null,',
'                    timestamp: Date.now()',
'                });',
'            } catch (_) {}',
'            return {',
'                success: true,',
'                data,',
'                message: `บันทึกลงเวลารูปแบบพิเศษสำเร็จ! เข้างาน ${checkInFinal} น. / เลิกงาน ${checkOutFinal} น. (สถานะ: ${evalResult.status_label})`',
'            };'
].join(eol);

if (!content.includes(targetSingleRet)) {
    console.error('Target single ret not found');
    process.exit(1);
}
content = content.replace(targetSingleRet, repSingleRet);

// 4d. Regular checkin return (around line 1280)
const targetRegRet = [
'        if (error) {',
'            return { success: false, message: \'ไม่สามารถบันทึกลงเวลาเข้าปฏิบัติงานได้: \' + error.message };',
'        }',
'',
'        return {',
'            success: true,',
'            data,',
'            message: `บันทึกลงเวลาเข้าปฏิบัติงานสำเร็จ เวลา ${checkInTime} น. (สถานะ: ${evalIn.status_label})`',
'        };'
].join(eol);

const repRegRet = [
'        if (error) {',
'            return { success: false, message: \'ไม่สามารถบันทึกลงเวลาเข้าปฏิบัติงานได้: \' + error.message };',
'        }',
'',
'        try {',
'            DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                action: \'checkin_checkout\',',
'                id: data?.id || null,',
'                personnel_id: payload.personnel_id || null,',
'                timestamp: Date.now()',
'            });',
'        } catch (_) {}',
'        return {',
'            success: true,',
'            data,',
'            message: `บันทึกลงเวลาเข้าปฏิบัติงานสำเร็จ เวลา ${checkInTime} น. (สถานะ: ${evalIn.status_label})`',
'        };'
].join(eol);

if (!content.includes(targetRegRet)) {
    console.error('Target reg ret not found');
    process.exit(1);
}
content = content.replace(targetRegRet, repRegRet);

// 5. submitSpecialRequest return
const targetSpecialRet = [
'        if (error) {',
'            return { success: false, message: \'ไม่สามารถส่งคำขอลงเวลากรณีพิเศษได้: \' + error.message };',
'        }',
'',
'        return {',
'            success: true,',
'            data,',
'            message: `ส่งคำขอลงเวลากรณีพิเศษสำเร็จ (${checkIn24} - ${checkOut24} น. สถานะ: ${targetStatus}) รอผู้ดูแลระบบอนุมัติ`',
'        };'
].join(eol);

const repSpecialRet = [
'        if (error) {',
'            return { success: false, message: \'ไม่สามารถส่งคำขอลงเวลากรณีพิเศษได้: \' + error.message };',
'        }',
'',
'        try {',
'            DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                action: \'special_request_submitted\',',
'                id: data?.id || null,',
'                personnel_id: payload.personnel_id || null,',
'                timestamp: Date.now()',
'            });',
'        } catch (_) {}',
'        return {',
'            success: true,',
'            data,',
'            message: `ส่งคำขอลงเวลากรณีพิเศษสำเร็จ (${checkIn24} - ${checkOut24} น. สถานะ: ${targetStatus}) รอผู้ดูแลระบบอนุมัติ`',
'        };'
].join(eol);

if (!content.includes(targetSpecialRet)) {
    console.error('Target special ret not found');
    process.exit(1);
}
content = content.replace(targetSpecialRet, repSpecialRet);

// 6. processSpecialRequestsBulk return
const targetBulkRet = [
'        const actionLabel = decision === \'approved\' ? \'อนุมัติ\' : \'ไม่อนุมัติ\';',
'        return {',
'            success: updatedCount > 0,',
'            count: updatedCount,',
'            message: `${actionLabel}รายการลงเวลากรณีพิเศษจำนวน ${updatedCount} รายการเรียบร้อยแล้ว`',
'        };'
].join(eol);

const repBulkRet = [
'        const actionLabel = decision === \'approved\' ? \'อนุมัติ\' : \'ไม่อนุมัติ\';',
'        try {',
'            DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                action: \'bulk_special_approval\',',
'                decision: decision,',
'                count: updatedCount,',
'                timestamp: Date.now()',
'            });',
'        } catch (_) {}',
'        return {',
'            success: updatedCount > 0,',
'            count: updatedCount,',
'            message: `${actionLabel}รายการลงเวลากรณีพิเศษจำนวน ${updatedCount} รายการเรียบร้อยแล้ว`',
'        };'
].join(eol);

if (!content.includes(targetBulkRet)) {
    console.error('Target bulk ret not found');
    process.exit(1);
}
content = content.replace(targetBulkRet, repBulkRet);

// 7. saveAdminAttendanceRecord and deleteAttendanceRecord
const targetAdminSave = [
'            if (error) {',
'                return { success: false, message: \'ไม่สามารถแก้ไขข้อมูลการลงเวลาได้: \' + error.message };',
'            }',
'            return { success: true, message: \'อัปเดตข้อมูลการลงเวลาเรียบร้อยแล้ว\' };',
'        } else {',
'            const { error } = await db',
'                .from(\'attendance_logs\')',
'                .insert(recordData);',
'            if (error) {',
'                return { success: false, message: \'ไม่สามารถเพิ่มข้อมูลการลงเวลาได้: \' + error.message };',
'            }',
'            return { success: true, message: \'เพิ่มข้อมูลการลงเวลาเรียบร้อยแล้ว\' };',
'        }',
'    }',
'',
'    static async deleteAttendanceRecord(logId) {',
'        const db = DatabaseService.getInstance().client;',
'        const { error } = await db',
'            .from(\'attendance_logs\')',
'            .delete()',
'            .eq(\'id\', logId);',
'',
'        if (error) {',
'            return { success: false, message: \'ไม่สามารถลบข้อมูลการลงเวลาได้: \' + error.message };',
'        }',
'        return { success: true, message: \'ลบรายการลงเวลาเรียบร้อยแล้ว\' };'
].join(eol);

const repAdminSave = [
'            if (error) {',
'                return { success: false, message: \'ไม่สามารถแก้ไขข้อมูลการลงเวลาได้: \' + error.message };',
'            }',
'            try {',
'                DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                    action: \'admin_save\',',
'                    id: payload.log_id || null,',
'                    personnel_id: payload.personnel_id || null,',
'                    timestamp: Date.now()',
'                });',
'            } catch (_) {}',
'            return { success: true, message: \'อัปเดตข้อมูลการลงเวลาเรียบร้อยแล้ว\' };',
'        } else {',
'            const { error } = await db',
'                .from(\'attendance_logs\')',
'                .insert(recordData);',
'            if (error) {',
'                return { success: false, message: \'ไม่สามารถเพิ่มข้อมูลการลงเวลาได้: \' + error.message };',
'            }',
'            try {',
'                DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                    action: \'admin_save\',',
'                    personnel_id: payload.personnel_id || null,',
'                    timestamp: Date.now()',
'                });',
'            } catch (_) {}',
'            return { success: true, message: \'เพิ่มข้อมูลการลงเวลาเรียบร้อยแล้ว\' };',
'        }',
'    }',
'',
'    static async deleteAttendanceRecord(logId) {',
'        const db = DatabaseService.getInstance().client;',
'        const { error } = await db',
'            .from(\'attendance_logs\')',
'            .delete()',
'            .eq(\'id\', logId);',
'',
'        if (error) {',
'            return { success: false, message: \'ไม่สามารถลบข้อมูลการลงเวลาได้: \' + error.message };',
'        }',
'        try {',
'            DatabaseService.getInstance().broadcastRealtimeEvent(\'attendance_updated\', {',
'                action: \'admin_delete\',',
'                id: logId,',
'                timestamp: Date.now()',
'            });',
'        } catch (_) {}',
'        return { success: true, message: \'ลบรายการลงเวลาเรียบร้อยแล้ว\' };'
].join(eol);

if (!content.includes(targetAdminSave)) {
    console.error('Target admin save not found');
    process.exit(1);
}
content = content.replace(targetAdminSave, repAdminSave);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched AttendanceModel.js');
