exports.up = function(knex) {
  return knex.schema.alterTable('songs', (table) => {
    return table.string('apple_music_url');
  });
};

exports.down = function(knex) {};
