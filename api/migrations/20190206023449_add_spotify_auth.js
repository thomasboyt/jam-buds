exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('users', (table) => {
    table.string('spotify_access_token').nullable();
    table.string('spotify_refresh_token').nullable();
    table.integer('spotify_expires_in').nullable();
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('spotify_access_token');
    table.dropColumn('spotify_refresh_token');
    table.dropColumn('spotify_expires_in');
  });
};
