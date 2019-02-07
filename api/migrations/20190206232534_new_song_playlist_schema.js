exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('playlist_entries', (table) => {
    table.dropColumn('bandcamp_url');
    table.dropColumn('bandcamp_streaming_url');
    table.dropColumn('bandcamp_track_id');
    table.dropColumn('soundcloud_url');
    table.dropColumn('soundcloud_streaming_url');
    table.dropColumn('soundcloud_track_id');
    table.dropColumn('youtube_url');
    table.dropColumn('source');
  });

  await knex.schema.alterTable('songs', (table) => {
    // TODO
  });
};

exports.down = async function(knex, Promise) {
  return Promise.resolve();
};
