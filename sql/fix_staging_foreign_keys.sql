ALTER TABLE staging.user_accounts 
DROP CONSTRAINT IF EXISTS fk_staging_user_accounts_personnel;

ALTER TABLE staging.user_accounts 
ADD CONSTRAINT fk_staging_user_accounts_personnel 
FOREIGN KEY (personnel_id) REFERENCES staging.personnel(id) ON DELETE SET NULL;

ALTER TABLE staging.attendance_logs 
DROP CONSTRAINT IF EXISTS fk_staging_attendance_logs_personnel;

ALTER TABLE staging.attendance_logs 
ADD CONSTRAINT fk_staging_attendance_logs_personnel 
FOREIGN KEY (personnel_id) REFERENCES staging.personnel(id) ON DELETE CASCADE;

ALTER TABLE staging.attendance_logs 
DROP CONSTRAINT IF EXISTS fk_staging_attendance_logs_user;

ALTER TABLE staging.attendance_logs 
ADD CONSTRAINT fk_staging_attendance_logs_user 
FOREIGN KEY (user_id) REFERENCES staging.user_accounts(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';

