exports.up = function(knex) {
  return knex.schema
    .createTable('songs', (table) => {
      table.increments('id');
      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      table.specificType('artists', 'text[]').notNullable();

      table.string('album').notNullable();

      table.string('title').notNullable();

      table
        .string('spotify_id')
        .index()
        .nullable();
    })
    .then(() => {
      return knex.schema.createTable('playlist_entries', (table) => {
        table.increments();
        table
          .timestamp('created_at')
          .notNullable()
          .defaultTo(knex.fn.now());

        table.integer('song_id').references('songs.id');

        table
          .integer('user_id')
          .references('users.id')
          .index();

        table.string('youtube_url');
      });
    })
    .then(() => {
      return knex.schema.createTable('songs_users_listened', (table) => {
        table.increments();
        table
          .timestamp('created_at')
          .notNullable()
          .defaultTo(knex.fn.now());

        table.integer('song_id').references('songs.id');

        table.integer('user_id').references('users.id');

        table.index(['user_id', 'song_id']);
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('songs_users_listened')
    .then(() => {
      return knex.schema.dropTable('playlist_entries');
    })
    .then(() => {
      return knex.schema.dropTable('songs');
    });
};
