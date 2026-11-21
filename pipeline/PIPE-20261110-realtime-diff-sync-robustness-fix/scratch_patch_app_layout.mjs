import fs from 'fs';

const filePath = 'assets/js/components/AppLayout.js';
let content = fs.readFileSync(filePath, 'utf8');
const eol = '\n';

const targetBlock = [
'                client.channel(`bma_admin_realtime_${activeSchema}`)',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'attendance_logs\' }, (payload) => {',
'                        AppLayout.refreshNotificationBell(currentUser);',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = record?.approved_by || record?.updated_by || currentUser?.full_name || \'Admin\';',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'attendance_logs\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-sync\', { detail: payload }));',
'                    })',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'password_reset_requests\' }, (payload) => {',
'                        AppLayout.refreshNotificationBell(currentUser);',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = record?.approved_by || record?.reviewed_by || currentUser?.full_name || \'Admin\';',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'password_reset_requests\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-sync\', { detail: payload }));',
'                    })',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'personnel\' }, (payload) => {',
'                        AppLayout.refreshNotificationBell(currentUser);',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = record?.updated_by || currentUser?.full_name || \'Admin\';',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'personnel\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-sync\', { detail: payload }));',
'                    })',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'system_settings\' }, (payload) => {',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = currentUser?.full_name || \'Admin\';',
'                        if (record) {',
'                            sessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(record));',
'                            window.dispatchEvent(new CustomEvent(\'bma:settings-updated\', { detail: record }));',
'                        }',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'system_settings\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-sync\', { detail: payload }));',
'                    })',
'                    .subscribe();'
].join(eol);

const repBlock = [
'                client.channel(`bma_admin_realtime_${activeSchema}`)',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'attendance_logs\' }, (payload) => {',
'                        AppLayout.refreshNotificationBell(currentUser);',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = record?.approved_by || record?.updated_by || currentUser?.full_name || \'Admin\';',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'attendance_logs\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                    })',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'user_accounts\' }, (payload) => {',
'                        AppLayout.refreshNotificationBell(currentUser);',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = record?.approved_by || record?.reviewed_by || currentUser?.full_name || \'Admin\';',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'user_accounts\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                    })',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'personnel\' }, (payload) => {',
'                        AppLayout.refreshNotificationBell(currentUser);',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = record?.updated_by || currentUser?.full_name || \'Admin\';',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'personnel\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                    })',
'                    .on(\'postgres_changes\', { event: \'*\', schema: activeSchema, table: \'system_settings\' }, (payload) => {',
'                        const record = payload.new || payload.old || null;',
'                        const action = (payload.eventType || \'sync\').toLowerCase();',
'                        const actor = currentUser?.full_name || \'Admin\';',
'                        if (record) {',
'                            sessionStorage.setItem(Config.STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(record));',
'                            window.dispatchEvent(new CustomEvent(\'bma:settings-updated\', { detail: record }));',
'                        }',
'                        window.dispatchEvent(new CustomEvent(\'bma:realtime-delta-sync\', {',
'                            detail: {',
'                                table: \'system_settings\',',
'                                record: record,',
'                                action: action,',
'                                actor: actor,',
'                                timestamp: Date.now(),',
'                                payload: payload',
'                            }',
'                        }));',
'                    })',
'                    .subscribe((status, err) => {',
'                        if (status !== \'SUBSCRIBED\') console.warn(\'[AppLayout Realtime] Status:\', status, err);',
'                    });'
].join(eol);

if (!content.includes(targetBlock)) {
    console.error('Target block not found in AppLayout.js');
    process.exit(1);
}
content = content.replace(targetBlock, repBlock);

// Also add logging to global realtime bus subscribe
const targetBusSub = [
'                    })',
'                    .subscribe();'
].join(eol);

const repBusSub = [
'                    })',
'                    .subscribe((status, err) => {',
'                        if (status !== \'SUBSCRIBED\') console.warn(\'[AppLayout Global Bus] Status:\', status, err);',
'                    });'
].join(eol);

if (!content.includes(targetBusSub)) {
    console.error('Target bus subscribe not found in AppLayout.js');
    process.exit(1);
}
content = content.replace(targetBusSub, repBusSub);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched AppLayout.js');
