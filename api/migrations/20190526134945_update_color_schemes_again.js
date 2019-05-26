exports.up = function(knex, Promise) {
  return knex.schema.alterTable('color_schemes', (table) => {
    table.dropColumn('background_color');
    table.dropColumn('card_background_color');
    table.string('background_gradient_name');
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
