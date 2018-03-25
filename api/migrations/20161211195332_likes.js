exports.up = function(knex, Promise) {
  return knex.schema.createTable('likes', (table) => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.integer('entry_id').references('playlist_entries.id');

    table.integer('user_id').references('users.id');

    // makes looking up whether a user has liked an entry fast
    table.index(['user_id', 'entry_id']);

    // makes looking up a user's liked songs fast
    table.index(['user_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('likes');
};
