const songData = require('./data/songs');

function createUser(knex, name, userId) {
  return knex('users').insert({
    id: userId,
    auth_token: name,
    twitter_name: name,
    twitter_id: `${userId}`,
    twitter_token: `${userId}`,
    twitter_secret: `${userId}`,
  });
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
    createUser(knex, 'jeff', 1),
    createUser(knex, 'dan', 2),
    createUser(knex, 'brad', 3),
    createUser(knex, 'vinny', 4),
  ]).then(() => {
    return knex.schema.raw(`SELECT setval('users_id_seq', 5)`)

  }).then(() => {
    // jeff follows dan and vinny
    return Promise.all([
      followUser(knex, 1, 2),
      followUser(knex, 1, 4),
    ]);
  }).then(() => {
    return Promise.all(songData.songs.map((s) => createSong(knex, s)));
  }).then(() => {
    return Promise.all(songData.entries.map((e) => createEntry(knex, e)));
  });
};
