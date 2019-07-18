exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE playlist_entries
      DROP CONSTRAINT "playlist_entries_source_check"
  `);
};

exports.down = function(knex) {
  return Promise.resolve();
};
