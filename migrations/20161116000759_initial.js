exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.timestamps();

    table.string('auth_token')
      .notNullable()
      .index()
      .unique();

    table.string('twitter_name')
      .notNullable()
      .index()
      .unique();

    table.string('twitter_id')
      .notNullable()
      .index()
      .unique();

    table.string('twitter_token')
      .notNullable();

    table.string('twitter_secret')
      .notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
