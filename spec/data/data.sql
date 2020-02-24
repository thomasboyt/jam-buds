-- this is in foreign-key-dependency order

\copy users from './data/users.csv' DELIMITER ',' CSV HEADER;
select setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id),0) + 1, false) FROM users;

\copy following from './data/following.csv' DELIMITER ',' CSV HEADER;

\copy songs from './data/songs.csv' DELIMITER ',' CSV HEADER;
select setval(pg_get_serial_sequence('songs', 'id'), coalesce(max(id),0) + 1, false) FROM songs;

\copy mixtapes from './data/mixtapes.csv' DELIMITER ',' CSV HEADER;
select setval(pg_get_serial_sequence('mixtapes', 'id'), coalesce(max(id),0) + 1, false) FROM mixtapes;

\copy mixtape_song_entries from './data/mixtape_song_entries.csv' DELIMITER ',' CSV HEADER;

\copy posts from './data/posts.csv' DELIMITER ',' CSV HEADER;
select setval(pg_get_serial_sequence('posts', 'id'), coalesce(max(id),0) + 1, false) FROM posts;