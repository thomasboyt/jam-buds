SELECT
    likes.*
--    NULL as "mixtape_id",
FROM likes
WHERE
    likes.user_id = :userId
    AND (COALESCE(:beforeTimestamp, NULL) IS NULL OR likes.created_at < :beforeTimestamp)
    AND (COALESCE(:afterTimestamp, NULL) IS NULL OR likes.created_at > :afterTimestamp)
ORDER BY created_at DESC
LIMIT
    CASE
        WHEN COALESCE(:afterTimestamp, NULL) IS NULL
        THEN :limit
        ELSE NULL
    END;