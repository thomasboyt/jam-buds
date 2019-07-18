exports.up = function(knex) {
  return knex.schema.alterTable('playlist_entries', (table) => {
    table.text('note').nullable();
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
