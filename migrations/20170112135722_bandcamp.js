
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('playlist_entries', (table) => {
    table.enum('source', ['youtube', 'bandcamp']).notNullable();

    table.string('bandcamp_track_id').nullable();
    table.string('bandcamp_url').nullable();
    table.string('bandcamp_streaming_url').nullable();
  });

};

exports.down = function(knex, Promise) {
  return Promise.resolve();

};
