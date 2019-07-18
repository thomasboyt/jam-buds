exports.up = function(knex) {
  return knex.schema.alterTable('color_schemes', (table) => {
    table.dropColumn('link_color');
    table.string('card_background_color');
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
