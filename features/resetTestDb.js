// this is the dumbest bullshit
require('ts-node/register');

const db = require('../src/server/db');

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