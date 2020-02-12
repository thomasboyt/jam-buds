SELECT users.*
FROM users
JOIN auth_tokens
ON auth_tokens.user_id = users.id
WHERE auth_tokens.auth_token = :authToken
