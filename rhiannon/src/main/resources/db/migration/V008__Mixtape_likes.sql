ALTER TABLE likes
    ADD COLUMN mixtape_id integer REFERENCES mixtapes (id) ON DELETE CASCADE,
    ALTER COLUMN song_id DROP NOT NULL;