exports.up = async function(knex, Promise) {
  await knex.schema.createTable('sign_in_tokens', (table) => {
    table.string('token').notNullable();
    table.string('email').notNullable();

    // used for rate-limiting, I guess?
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(['token']);
    table.index(['email']);
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable('sign_in_tokens');
};
