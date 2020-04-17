SELECT users.*
FROM following
JOIN users ON users.id = following.user_id
WHERE following.following_id = :userId
