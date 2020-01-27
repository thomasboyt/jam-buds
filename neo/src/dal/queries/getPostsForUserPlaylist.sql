-- Notes:
--
-- * "After" queries purposefully do not have a limit applied. We may want to
--   do this logic as a check in FeedService instead of in the query.
SELECT
    posts.song_id,
    posts.mixtape_id,
    posts.created_at as "timestamp"
FROM posts
JOIN users ON users.id = posts.user_id
WHERE
    posts.user_id = ${userId}
    AND (${beforeTimestamp} IS NULL OR posts.created_at < ${beforeTimestamp})
    AND (${afterTimestamp} IS NULL OR posts.created_at > ${afterTimestamp})
    AND (NOT ${onlyMixtapes} OR posts.mixtape_id IS NOT NULL)
ORDER BY timestamp DESC
LIMIT
    CASE
        WHEN ${afterTimestamp} IS NULL
        THEN ${limit}
        ELSE NULL
    END;
