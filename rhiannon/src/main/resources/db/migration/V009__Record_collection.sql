CREATE TABLE public.albums (
    id SERIAL PRIMARY KEY,
    created_at timestamp DEFAULT clock_timestamp() NOT NULL,

    artists text[] NOT NULL,
    title text NOT NULL,
    album_art text NOT NULL,

    spotify_id text,
    apple_music_id text,
    spotify_url text,
    apple_music_url text
);

ALTER TABLE posts ADD COLUMN album_id integer REFERENCES albums (id) ON DELETE CASCADE;

ALTER TABLE likes ADD COLUMN album_id integer REFERENCES albums (id) ON DELETE CASCADE;