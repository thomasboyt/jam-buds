exports.up = function(knex) {
  return knex.schema.createTable('following', (table) => {
    table
      .integer('user_id')
      .index()
      .references('users.id');

    table.integer('following_id').references('users.id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('following');
};
