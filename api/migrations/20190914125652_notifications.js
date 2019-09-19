exports.up = function(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments();

    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.raw('CLOCK_TIMESTAMP()'));

    // user actually getting the notification
    table
      .integer('target_user_id')
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE');

    table.enum('type', ['like', 'follow', 'joined', 'system'], {
      useNative: true,
      enumName: 'notification_types',
    });

    // e.g.:
    // - the user who liked your post
    // - the user who just followed you
    table
      .integer('notification_user_id')
      .references('users.id')
      .onDelete('CASCADE');

    table
      .integer('notification_song_id')
      .references('songs.id')
      .onDelete('CASCADE');

    // used for freeform text notifications ("check out our hot new newsletter
    // etc")
    table.string('notification_system_message');

    table.boolean('read').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.dropTable('notifications');
};
