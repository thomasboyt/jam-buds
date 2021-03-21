SELECT
    *,
    (
        SELECT COUNT(*) FROM likes WHERE likes.song_id=songs.id
    ) AS "meta_like_count",
    EXISTS(
        SELECT 1 FROM likes WHERE likes.user_id=:currentUserId AND likes.song_id=songs.id
    ) AS "meta_is_liked"
FROM
    songs
WHERE
    songs.bandcamp_url = :bandcampUrl
