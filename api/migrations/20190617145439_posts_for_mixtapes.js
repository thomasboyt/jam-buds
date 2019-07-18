exports.up = function(knex) {
  return knex.schema.alterTable('posts', (table) => {
    table
      .integer('mixtape_id')
      .references('mixtapes.id')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {};
