exports.up = function(knex, Promise) {
  return knex.schema.alterTable('posts', (table) => {
    table.dropColumn('note');
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
