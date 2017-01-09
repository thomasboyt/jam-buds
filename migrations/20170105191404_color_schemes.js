
exports.up = function(knex, Promise) {
  return knex.schema.createTable('color_schemes', (table) => {
    table.increments();

    table.integer('user_id')
      .references('users.id')
      .notNullable();

    table.string('background_color').notNullable();
    table.string('text_color').notNullable();
    table.string('link_color').notNullable();
    table.string('entry_background_color').notNullable();
    table.string('entry_text_color').notNullable();
    table.string('entry_link_color').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('color_schemes');
};
