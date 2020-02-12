SELECT
    mixtapes.*,
    (SELECT users.name FROM users WHERE users.id=mixtapes.user_id) as author_name,
    (SELECT COUNT (*) FROM mixtape_song_entries WHERE mixtape_id=mixtapes.id) as song_count
FROM
    mixtapes
JOIN
    users ON users.id = mixtapes.user_id
WHERE
    mixtapes.id IN (<mixtapeIds>);