exports.up = function(knex, Promise) {
  return knex.raw('ALTER TABLE songs ALTER COLUMN album DROP NOT NULL;');
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
