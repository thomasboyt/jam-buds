exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('users', (table) => {
    table
      .string('email')
      .index()
      .nullable();
  });
};

exports.down = function(knex) {
  return Promise.resolve();
};
