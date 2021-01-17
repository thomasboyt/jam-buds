SELECT EXISTS(
    SELECT * FROM songs_users_listened WHERE song_id = :songId AND user_id = :userId
)
