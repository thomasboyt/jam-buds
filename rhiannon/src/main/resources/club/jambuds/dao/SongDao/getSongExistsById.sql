SELECT EXISTS(
    SELECT * FROM songs WHERE id = :songId
)