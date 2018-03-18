
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('songs', (table) => {
    table.string('album_art');
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();

};
