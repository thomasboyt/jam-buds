exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE posts
      ALTER COLUMN "created_at" SET DEFAULT CLOCK_TIMESTAMP()
  `);
};

exports.down = function(knex) {};
