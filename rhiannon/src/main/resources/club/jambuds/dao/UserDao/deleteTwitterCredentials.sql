UPDATE users SET
    twitter_id = NULL,
    twitter_name = NULL,
    twitter_secret = NULL,
    twitter_token = NULL
WHERE id=:userId