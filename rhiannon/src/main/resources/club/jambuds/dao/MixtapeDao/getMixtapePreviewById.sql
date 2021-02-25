SELECT
    mixtapes.*,
    (SELECT users.name FROM users WHERE users.id=mixtapes.user_id) as author_name,
    (SELECT COUNT (*) FROM mixtape_song_entries WHERE mixtape_id=mixtapes.id) as song_count,
    (
        SELECT COUNT(*) FROM likes WHERE likes.mixtape_id=mixtapes.id
    ) AS "meta_like_count",
    EXISTS(
        SELECT 1 FROM likes WHERE likes.user_id=:currentUserId AND likes.mixtape_id=mixtapes.id
    ) AS "meta_is_liked"
FROM
    mixtapes
JOIN
    users ON users.id = mixtapes.user_id
WHERE
    mixtapes.id=:mixtapeId