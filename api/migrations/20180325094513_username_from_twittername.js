exports.up = async function(knex, Promise) {
  await knex.schema.alterTable('users', (table) => {
    table.string('name').nullable(); // make nullable initially
  });

  await knex('users')
    .select()
    .map(async (row) => {
      await knex('users')
        .where({ id: row.id })
        .update({ name: row.twitter_name });
    });

  await knex.raw('ALTER TABLE users ALTER COLUMN name SET NOT NULL;');
};

exports.down = function(knex) {
  return Promise.resolve();
};
