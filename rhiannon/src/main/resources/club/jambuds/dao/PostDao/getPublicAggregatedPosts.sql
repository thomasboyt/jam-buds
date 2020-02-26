-- Notes:
--
-- * "After" queries purposefully do not have a limit applied. We may want to
--   do this logic as a check in PlaylistService instead of in the query.
--
-- * The COALESCE(NULL, :timestamp) calls shouldn't be necessary, but I think
--   are needed due to usage of Java 8's time.Instant.
SELECT
    posts.song_id,
    posts.mixtape_id,
    MIN(posts.created_at) as "agg_timestamp",
    jsonb_agg(json_build_object(
        'userName', users.name,
        'note', posts.note,
        'createdAt', posts.created_at
    )) as "agg_posts"
FROM posts
JOIN users ON users.id = posts.user_id
WHERE
    users.show_in_public_feed = true
GROUP BY posts.song_id, posts.mixtape_id
HAVING
    (COALESCE(NULL, :beforeTimestamp) IS NULL OR MIN(posts.created_at) < :beforeTimestamp)
    AND (COALESCE(NULL, :afterTimestamp) IS NULL OR MIN(posts.created_at) > :afterTimestamp)
ORDER BY agg_timestamp DESC
LIMIT
    CASE
        WHEN COALESCE(NULL, :afterTimestamp) IS NULL
        THEN :limit
        ELSE NULL
    END;
