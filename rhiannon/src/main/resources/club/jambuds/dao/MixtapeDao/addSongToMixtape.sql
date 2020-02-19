INSERT INTO mixtape_song_entries
    (mixtape_id, song_id, rank)
VALUES (
    :mixtapeId,
    :songId,
    COALESCE((SELECT max(rank) + 1 FROM mixtape_song_entries WHERE mixtape_id = :mixtapeId), 1)
)