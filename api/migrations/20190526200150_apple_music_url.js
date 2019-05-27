exports.up = function(knex, Promise) {
  return knex.schema.alterTable('songs', (table) => {
    return table.string('apple_music_url');
  });
};

exports.down = function(knex, Promise) {};
