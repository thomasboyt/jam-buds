
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({
          id: 1,
          auth_token: 'devaccount',
          twitter_name: 'devaccount',
          twitter_id: '1234',
          twitter_token: '1234',
          twitter_secret: '1234',
        }),
      ]);
    });
};
