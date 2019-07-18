exports.up = function(knex) {
  return knex.schema
    .alterTable('playlist_entries', (table) => {
      table.enum('source', ['youtube', 'bandcamp']); //.notNullable();

      table.string('bandcamp_track_id').nullable();
      table.string('bandcamp_url').nullable();
      table.string('bandcamp_streaming_url').nullable();
    })
    .then(() => {
      return knex('playlist_entries').update({ source: 'youtube' });
    })
    .then(() => {
      return knex.raw(
        'ALTER TABLE playlist_entries ALTER COLUMN source SET NOT NULL;'
      );
    });
};

exports.down = function(knex) {
  return Promise.resolve();
};
