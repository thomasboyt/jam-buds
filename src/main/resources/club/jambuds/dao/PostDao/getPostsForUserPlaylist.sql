-- Notes:
--
-- * "After" queries purposefully do not have a limit applied. We may want to
--   do this logic as a check in FeedService instead of in the query.
SELECT
    posts.*
FROM posts
JOIN users ON users.id = posts.user_id
WHERE
    posts.user_id = :userId
    AND (COALESCE(:beforeTimestamp, NULL) IS NULL OR posts.created_at < :beforeTimestamp)
    AND (COALESCE(:afterTimestamp, NULL) IS NULL OR posts.created_at > :afterTimestamp)
    AND (NOT :onlyMixtapes OR posts.mixtape_id IS NOT NULL)
ORDER BY created_at DESC
LIMIT
    CASE
        WHEN COALESCE(:afterTimestamp, NULL) IS NULL
        THEN :limit
        ELSE NULL
    END;
