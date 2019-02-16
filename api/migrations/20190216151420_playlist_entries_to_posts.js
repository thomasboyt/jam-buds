exports.up = async function(knex, Promise) {
  await knex.schema.renameTable('playlist_entries', 'posts');
  await knex.raw(
    'ALTER SEQUENCE playlist_entries_id_seq RENAME TO posts_id_seq'
  );
  await knex.raw(
    `ALTER TABLE posts
    RENAME CONSTRAINT playlist_entries_song_id_foreign TO posts_song_id_foreign`
  );
  await knex.raw(
    `ALTER TABLE posts
    RENAME CONSTRAINT playlist_entries_user_id_foreign TO posts_user_id_foreign`
  );
  await knex.raw(`ALTER INDEX playlist_entries_pkey RENAME TO posts_pkey`);
  await knex.raw(
    `ALTER INDEX playlist_entries_user_id_index RENAME TO posts_user_id_index`
  );
};

exports.down = async function(knex, Promise) {
  await knex.schema.renameTable('posts', 'playlist_entries');
};
