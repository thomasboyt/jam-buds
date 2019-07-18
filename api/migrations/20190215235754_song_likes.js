exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('likes', (table) => {
    table.dropColumn('entry_id');
    table
      .integer('song_id')
      .references('songs.id')
      .notNullable();

    // makes looking up whether a user has liked a song fast
    table.index(['user_id', 'song_id']);
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
