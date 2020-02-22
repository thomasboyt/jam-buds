SELECT EXISTS(
    SELECT * FROM likes WHERE song_id = :songId AND user_id = :userId
)