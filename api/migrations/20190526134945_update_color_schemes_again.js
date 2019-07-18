exports.up = function(knex) {
  return knex.schema.alterTable('color_schemes', (table) => {
    table.dropColumn('background_color');
    table.dropColumn('card_background_color');
    table.string('background_gradient_name');
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
