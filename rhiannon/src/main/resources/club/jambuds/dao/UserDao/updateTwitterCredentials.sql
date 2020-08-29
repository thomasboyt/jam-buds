UPDATE users SET
    twitter_id = :twitterId,
    twitter_name = :twitterName,
    twitter_token = :twitterToken,
    twitter_secret = :twitterSecret
WHERE id=:userId