SELECT *
FROM (
    SELECT
        posts.song_id,
        posts.mixtape_id,
        posts.album_id,
        COALESCE(
            (SELECT user_posts.created_at
                FROM posts AS user_posts
                WHERE user_id = :currentUserId
                AND user_posts.song_id=posts.song_id),
            MIN(posts.created_at)
        ) AS agg_timestamp,
        jsonb_agg(json_build_object(
            'id', posts.id,
            'userName', users.name,
            'note', posts.note,
            'createdAt', posts.created_at
        )) as "agg_posts"
    FROM posts
    JOIN users ON users.id = posts.user_id
    WHERE
        posts.user_id IN (SELECT following_id FROM following WHERE user_id = :currentUserId)
        OR posts.user_id = :currentUserId
    GROUP BY posts.song_id, posts.mixtape_id, posts.album_id
) AS aggregated_posts
WHERE
    (COALESCE(:beforeTimestamp, NULL) IS NULL OR aggregated_posts.agg_timestamp < :beforeTimestamp)
    AND
    (COALESCE(:afterTimestamp, NULL) IS NULL OR aggregated_posts.agg_timestamp > :afterTimestamp)
ORDER BY agg_timestamp DESC
LIMIT
    CASE
        WHEN COALESCE(:afterTimestamp, NULL) IS NULL
        THEN :limit
        ELSE NULL
    END;
