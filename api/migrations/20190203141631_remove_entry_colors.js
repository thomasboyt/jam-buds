exports.up = function(knex, Promise) {
  return knex.schema.alterTable('color_schemes', (table) => {
    table.dropColumn('entry_background_color');
    table.dropColumn('entry_text_color');
    table.dropColumn('entry_link_color');
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
