exports.up = function(knex, Promise) {
  return knex.schema.createTable('following', (table) => {
    table
      .integer('user_id')
      .index()
      .references('users.id');

    table.integer('following_id').references('users.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('following');
};
