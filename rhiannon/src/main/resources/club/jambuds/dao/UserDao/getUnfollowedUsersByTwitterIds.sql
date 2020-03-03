SELECT *
FROM users
WHERE twitter_id IN (<twitterIds>)
AND users.id NOT IN (
    SELECT following_id
    FROM following
    JOIN users ON users.id = following.following_id
    WHERE user_id = :userId
)
