ALTER TABLE notifications
    DROP COLUMN notification_user_id,
    DROP COLUMN notification_song_id,
    DROP COLUMN notification_system_message,
    ADD COLUMN key varchar(256),
    ADD COLUMN body text,
    ADD COLUMN url text;