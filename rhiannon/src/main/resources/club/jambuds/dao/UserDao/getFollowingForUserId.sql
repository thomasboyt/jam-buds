SELECT users.*
FROM following
JOIN users ON users.id = following.following_id
WHERE following.user_id = :userId
