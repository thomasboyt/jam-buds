SELECT
    songs.*,
    (
        SELECT COUNT(*) FROM likes WHERE likes.song_id=songs.id
    ) AS like_count,
    EXISTS(
        SELECT 1 FROM likes WHERE likes.user_id=:currentUserId AND likes.song_id=songs.id
    ) AS is_liked
FROM mixtape_song_entries
JOIN songs ON mixtape_song_entries.song_id = songs.id
WHERE mixtape_song_entries.mixtape_id = :mixtapeId
