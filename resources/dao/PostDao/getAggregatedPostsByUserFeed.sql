SELECT *
FROM (
    SELECT
        song_id
        mixtape_id,
        COALESCE(
            (SELECT user_posts.created_at
                FROM posts AS user_posts
                WHERE user_id = :currentUserId
                AND user_posts.song_id=posts.song_id),
            MIN(posts.created_at)
        ) AS timestamp,
        ARRAY_AGG(users.name) as user_names
    FROM posts
    JOIN users ON users.id = posts.user_id
    WHERE
        posts.user_id IN (SELECT following_id FROM following WHERE user_id = :currentUserId)
        OR posts.user_id = :currentUserId
    GROUP BY posts.song_id, posts.mixtape_id
) AS aggregated_posts
WHERE
    (COALESCE(NULL, :beforeTimestamp) IS NULL OR aggregated_posts.timestamp < :beforeTimestamp)
    AND (COALESCE(NULL, :afterTimestamp) IS NULL OR aggregated_posts.timestamp > :afterTimestamp)
ORDER BY timestamp DESC
LIMIT
    CASE
        WHEN COALESCE(NULL, :afterTimestamp) IS NULL
        THEN :limit
        ELSE NULL
    END;
