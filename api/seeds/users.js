const songData = require('./data/songs');
const getSpotifySongs = require('./data/spotifySongs');

function createUser(knex, id, name, opts) {
  opts = opts || {};

  return knex('users').insert(
    Object.assign(
      {
        id,
        name,
        auth_token: name,
        email: `${name}@jambuds.club`,
      },
      opts
    )
  );
}

function followUser(knex, userId, followingId) {
  return knex('following').insert({
    user_id: userId,
    following_id: followingId,
  });
}

function createSong(knex, song) {
  return knex('songs').insert(song, 'id');
}

function createPost(knex, post) {
  return knex('posts').insert(post);
}

exports.seed = async function(knex, Promise) {
  await Promise.all([
    createUser(knex, 1, 'jeff'),
    createUser(knex, 2, 'dan'),
    createUser(knex, 3, 'brad'),
    createUser(knex, 4, 'vinny'),
    createUser(knex, 5, 'abe'),
  ]);

  await knex.schema.raw(`SELECT setval('users_id_seq', 6)`);

  // jeff follows dan and vinny
  await Promise.all([followUser(knex, 1, 2), followUser(knex, 1, 4)]);

  await Promise.all([
    Promise.all(songData.songs.map((s) => createSong(knex, s))),
    knex.schema.raw(
      `SELECT setval('songs_id_seq', ${songData.songs.length + 1})`
    ),
  ]);

  await Promise.all([
    Promise.all(songData.posts.map((p) => createPost(knex, p))),
    knex.schema.raw(
      `SELECT setval('posts_id_seq', ${songData.posts.length + 1})`
    ),
  ]);

  const spotifySongs = await getSpotifySongs();
  for (let song of spotifySongs) {
    const [id] = await createSong(knex, song);
    await createPost(knex, {
      user_id: 5, // abe
      song_id: id,
      created_at: song.created_at,
    });
  }
};
