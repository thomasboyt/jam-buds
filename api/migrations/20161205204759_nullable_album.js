exports.up = function(knex) {
  return knex.raw('ALTER TABLE songs ALTER COLUMN album DROP NOT NULL;');
};

exports.down = function(knex) {
  return Promise.resolve();
};
