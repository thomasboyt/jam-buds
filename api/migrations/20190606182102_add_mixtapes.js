exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('mixtapes', (table) => {
      table.increments();

      table.string('title').notNullable();

      table
        .integer('user_id')
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE');

      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.raw('CLOCK_TIMESTAMP()'));

      table.timestamp('published_at');
    }),

    knex.schema.createTable('mixtape_song_entries', (table) => {
      table
        .integer('mixtape_id')
        .notNullable()
        .references('mixtapes.id')
        .onDelete('CASCADE');

      table
        .integer('song_id')
        .notNullable()
        .references('songs.id')
        .onDelete('CASCADE');

      table.integer('rank').notNullable();

      // TODO: indexes?
    }),
  ]);
};

exports.down = function(knex) {};
