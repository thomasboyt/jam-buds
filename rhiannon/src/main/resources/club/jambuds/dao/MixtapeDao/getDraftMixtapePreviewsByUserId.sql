SELECT
    mixtapes.*,
    (SELECT users.name FROM users WHERE users.id=mixtapes.user_id) as author_name,
    (SELECT COUNT (*) FROM mixtape_song_entries WHERE mixtape_id=mixtapes.id) as song_count,
    0 AS "meta_like_count",
    false AS "meta_is_liked"
FROM
    mixtapes
JOIN
    users ON users.id = mixtapes.user_id
WHERE
    mixtapes.user_id = :userId
    AND published_at IS NULL;
