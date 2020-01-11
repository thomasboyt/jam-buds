const slugify = require('@sindresorhus/slugify');

exports.up = async function(knex) {
  await knex.schema.alterTable('mixtapes', (table) => {
    table.string('slug');
  });

  await knex('mixtapes')
    .select()
    .map(async (row) => {
      await knex('mixtapes')
        .where({ id: row.id })
        .update({
          slug: slugify(row.title, {
            decamelize: false,
          }),
        });
    });

  await knex.raw('ALTER TABLE mixtapes ALTER COLUMN slug SET NOT NULL;');
};

exports.down = function(knex) {};
