ALTER TABLE songs
    ADD COLUMN bandcamp_id varchar(64),
    ADD COLUMN bandcamp_url varchar(2048),
    ADD COLUMN bandcamp_can_stream boolean;

ALTER TABLE albums
    ADD COLUMN bandcamp_url varchar(2048);

CREATE INDEX songs_bandcamp_url_index ON songs USING btree (bandcamp_url);

CREATE INDEX albums_bandcamp_url_index ON albums USING btree (bandcamp_url);
