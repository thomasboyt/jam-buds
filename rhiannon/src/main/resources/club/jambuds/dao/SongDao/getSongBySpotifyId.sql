SELECT
    *,
    (
        SELECT COUNT(*) FROM likes WHERE likes.song_id=songs.id
    ) AS like_count,
    EXISTS(
        SELECT 1 FROM likes WHERE likes.user_id=:currentUserId AND likes.song_id=songs.id
    ) AS is_liked
FROM
    songs
WHERE
    songs.spotify_id = :spotifyId