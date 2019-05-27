exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('auth_tokens', (table) => {
      table.string('auth_token').notNullable();
      table
        .integer('user_id')
        .references('users.id')
        .onDelete('CASCADE');

      table.index(['auth_token']);
      table.index(['user_id']);
    }),
    knex.schema.alterTable('users', (table) => {
      table.dropColumn('auth_token');
    }),
  ]);
};

exports.down = function(knex, Promise) {};
