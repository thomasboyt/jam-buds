DROP TABLE anonymous_spotify_credentials;
ALTER TABLE users
    DROP COLUMN spotify_access_token,
    DROP COLUMN spotify_refresh_token,
    DROP COLUMN spotify_expires_at;