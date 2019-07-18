exports.up = function(knex) {
  return knex.schema.alterTable('posts', (table) => {
    table.dropColumn('note');
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
