exports.up = function(knex, Promise) {
  return knex.schema.alterTable('users', (table) => {
    table.boolean('show_in_public_feed');
  });
};

exports.down = function(knex, Promise) {};
