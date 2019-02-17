exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('songs', (table) => {
    table.string('isrc_id').nullable();
    table.string('apple_music_id').nullable();
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.alterTable('songs', (table) => {
    table.dropColumn('isrc_id');
    table.dropColumn('apple_music_id');
  });
};
