const songData = require('./data/songs');

function createUser(knex, id, name, opts) {
  opts = opts || {};

  return knex('users').insert(
    Object.assign(
      {
        id,
        name,
        auth_token: name,
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
  return knex('songs').insert(song);
}

function createEntry(knex, entry) {
  return knex('playlist_entries').insert(entry);
}

exports.seed = function(knex, Promise) {
  return Promise.all([
    createUser(knex, 1, 'jeff'),
    createUser(knex, 2, 'dan'),
    createUser(knex, 3, 'brad'),
    createUser(knex, 4, 'vinny'),
  ])
    .then(() => {
      return knex.schema.raw(`SELECT setval('users_id_seq', 5)`);
    })
    .then(() => {
      // jeff follows dan and vinny
      return Promise.all([followUser(knex, 1, 2), followUser(knex, 1, 4)]);
    })
    .then(() => {
      return Promise.all([
        Promise.all(songData.songs.map((s) => createSong(knex, s))),
        knex.schema.raw(
          `SELECT setval('songs_id_seq', ${songData.songs.length + 1})`
        ),
      ]);
    })
    .then(() => {
      return Promise.all([
        Promise.all(songData.entries.map((e) => createEntry(knex, e))),
        knex.schema.raw(
          `SELECT setval('playlist_entries_id_seq', ${songData.entries.length +
            1})`
        ),
      ]);
    });
};
