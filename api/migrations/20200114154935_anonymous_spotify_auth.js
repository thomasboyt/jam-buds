exports.up = async function(knex) {
  await knex.schema.createTable('anonymous_spotify_credentials', (table) => {
    table.string('anon_user_token');
    table.string('access_token');
    table.string('refresh_token');
    table.timestamp('expires_at', true);
    table.index(['anon_user_token']);
  });
};

exports.down = function(knex) {};
