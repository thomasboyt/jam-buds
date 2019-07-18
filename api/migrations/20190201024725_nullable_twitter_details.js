exports.up = async function(knex, Promise) {
  return knex.raw(
    `ALTER TABLE users
      ALTER COLUMN twitter_name DROP NOT NULL,
      ALTER COLUMN twitter_id DROP NOT NULL,
      ALTER COLUMN twitter_token DROP NOT NULL,
      ALTER COLUMN twitter_secret DROP NOT NULL;
    `
  );
};

exports.down = function(knex) {
  return Promise.resolve();
};
