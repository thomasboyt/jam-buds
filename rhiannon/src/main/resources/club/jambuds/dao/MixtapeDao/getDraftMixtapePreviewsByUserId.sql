SELECT
    mixtapes.*
FROM
    mixtapes
JOIN
    users ON users.id = mixtapes.user_id
WHERE
    mixtapes.user_id = :userId
    AND published_at IS NULL;
