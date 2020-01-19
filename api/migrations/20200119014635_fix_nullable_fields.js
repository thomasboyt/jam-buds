exports.up = async function(knex) {
  const setNotNull = (tableName, columnName) =>
    knex.raw(
      `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} SET NOT NULL;`
    );

  const columns = [
    'anon_user_token',
    'access_token',
    'refresh_token',
    'expires_at',
  ];
  for (const column of columns) {
    await setNotNull('anonymous_spotify_credentials', column);
  }

  await setNotNull('auth_tokens', 'user_id');
  await setNotNull('color_schemes', 'background_gradient_name');
  await setNotNull('following', 'user_id');
  await setNotNull('following', 'following_id');
  await setNotNull('likes', 'user_id');
  await setNotNull('notifications', 'type');
  await setNotNull('posts', 'user_id');
  await setNotNull('users', 'email');
};

exports.down = function(knex) {};
