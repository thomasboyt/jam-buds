
exports.up = function(knex, Promise) {
  return knex.schema.createTable('songs', (table) => {
    table.increments('id');
    table.timestamps();

    table
      .specificType('artists', 'text[]')
      .notNullable();

    table.string('album')
      .notNullable();

    table.string('title')
      .notNullable();

    table.string('spotify_id')
      .notNullable();

    table.string('youtube_url')
      .index()
      .unique();

    table.string('spotify_url')
      .index()
      .unique();

  }).then(() => {
    return knex.schema.createTable('songs_users', (table) => {
      table.increments();
      table.timestamps();

      table.integer('song_id')
        .references('songs.id');

      table.integer('user_id')
        .references('users.id')
        .index();
    });
  }).then(() => {
    return knex.schema.createTable('songs_users_listened', (table) => {
      table.increments();
      table.timestamps();

      table.integer('song_id')
        .references('songs.id');

      table.integer('user_id')
        .references('users.id');

      table.index(['user_id', 'song_id']);
    });
  });

};

exports.down = function(knex, Promise) {
};
