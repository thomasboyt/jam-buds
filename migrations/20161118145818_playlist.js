
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
      .index()
      .nullable();

  }).then(() => {

    return knex.schema.createTable('playlist_entry', (table) => {
      table.increments();
      table.timestamps();

      table.integer('song_id')
        .references('songs.id');

      table.integer('user_id')
        .references('users.id')
        .index();

      table.string('youtube_url');
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
