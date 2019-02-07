exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('spotify_expires_in');
    table.timestamp('spotify_expires_at', true).nullable();
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
