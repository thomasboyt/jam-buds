exports.up = function(knex, Promise) {
  return knex.schema.alterTable('color_schemes', (table) => {
    table.dropColumn('link_color');
    table.string('card_background_color');
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
