
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('playlist_entries', (table) => {
    table.text('note').nullable();
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();

};

