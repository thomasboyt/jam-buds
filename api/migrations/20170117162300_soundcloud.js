exports.up = function(knex) {
  return knex.schema
    .alterTable('playlist_entries', (table) => {
      table.string('soundcloud_track_id').nullable();
      table.string('soundcloud_url').nullable();
      table.string('soundcloud_streaming_url').nullable();
    })
    .then(() => {
      return knex
        .raw(
          'ALTER TABLE playlist_entries DROP CONSTRAINT "playlist_entries_source_check";'
        )
        .then(() => {
          return knex.raw(`
        ALTER TABLE playlist_entries
          ADD CONSTRAINT "playlist_entries_source_check"
            CHECK (source = ANY (ARRAY['youtube'::text, 'bandcamp'::text, 'soundcloud'::text]));
      `);
        });
    });
};

exports.down = function(knex) {
  return Promise.resolve();
};
