exports.up = function(knex) {
  return knex.schema.alterTable('color_schemes', (table) => {
    table.dropColumn('entry_background_color');
    table.dropColumn('entry_text_color');
    table.dropColumn('entry_link_color');
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
