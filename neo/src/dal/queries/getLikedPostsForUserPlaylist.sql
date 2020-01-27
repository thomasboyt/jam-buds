-- Notes:
--
-- * "After" queries purposefully do not have a limit applied. We may want to
--   do this logic as a check in FeedService instead of in the query.
SELECT
    likes.song_id,
    -- some day:
    -- likes.mixtape_id,
    likes.created_at as "timestamp"
FROM likes
WHERE
    likes.user_id = ${userId}
    AND ${beforeTimestamp} IS NULL OR likes.created_at < ${beforeTimestamp}
    AND ${afterTimestamp} IS NULL OR likes.created_at > ${afterTimestamp}
ORDER BY timestamp DESC
LIMIT
    CASE
        WHEN ${afterTimestamp} IS NULL
        THEN ${limit}
        ELSE NULL
    END;
