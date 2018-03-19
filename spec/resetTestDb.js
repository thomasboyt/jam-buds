// this is the dumbest bullshit
require('ts-node/register');

console.log('resetting test db');

const db = require('../api/src/db');

db.configureDatabase();

console.log('rolling back');

db.db.migrate.rollback().then(() => {
  console.log('running migrations');
  return db.db.migrate.latest();

}).then(() => {
  console.log('running seeds')
  return db.db.seed.run();

}).finally(() => {
  db.db.destroy();
});