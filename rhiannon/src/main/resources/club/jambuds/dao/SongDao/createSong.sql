INSERT INTO songs
    (title, artists, album, album_art, spotify_id, isrc_id, apple_music_id, apple_music_url)
VALUES
    (:title, :artists, :album, :albumArt, :spotifyId, :isrcId, :appleMusicId, :appleMusicUrl)
RETURNING
    *, 0 as like_count, false as is_liked