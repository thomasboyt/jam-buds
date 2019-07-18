exports.up = function(knex) {
  return knex.schema.alterTable('songs', (table) => {
    table.string('album_art');
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
