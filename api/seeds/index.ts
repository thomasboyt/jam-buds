import Knex from 'knex';
import { db } from '../src/db';

import * as songData from './data/songs';
import { getSpotifySongs } from './data/spotifySongs';
import { createUser, updateTwitterCredentials } from '../src/models/user';
import {
  createMixtapeForUser,
  addSongToMixtape,
  publishMixtape,
} from '../src/models/mixtapes';

async function createSeedUser(name: string) {
  const user = await createUser({
    name,
    email: `${name}@jambuds.club`,
  });

  await db!('auth_tokens').insert({
    auth_token: name,
    user_id: user.id,
  });

  return user;
}

function followUser(knex: Knex, userId: number, followingId: number) {
  return knex('following').insert({
    user_id: userId,
    following_id: followingId,
  });
}

// TODO
async function createSong(knex: Knex, song: any) {
  const result = await knex('songs').insert(song, ['id']);
  return result[0].id;
}

// TODO
function createPost(knex: Knex, post: any) {
  return knex('posts').insert(post);
}

export default async function seed() {
  const jeff = await createSeedUser('jeff'); // 1
  await updateTwitterCredentials(jeff, {
    twitterId: '12223',
    twitterName: 'jeffgerstmann',
    twitterToken: 'token',
    twitterSecret: 'secret',
  });

  const dan = await createSeedUser('dan');
  await updateTwitterCredentials(jeff, {
    twitterId: '36311369',
    twitterName: 'danryckert',
    twitterToken: 'token',
    twitterSecret: 'secret',
  });

  await createSeedUser('brad');
  const vinny = await createSeedUser('vinny');
  const abe = await createSeedUser('abe'); // 5

  // jeff follows dan and vinny
  await Promise.all([
    followUser(db!, jeff.id, dan.id),
    followUser(db!, jeff.id, vinny.id),
  ]);

  await Promise.all([
    Promise.all(songData.songs.map((s) => createSong(db!, s))),
    db!.schema.raw(
      `SELECT setval('songs_id_seq', ${songData.songs.length + 1})`
    ),
  ]);

  await Promise.all([
    Promise.all(songData.posts.map((p) => createPost(db!, p))),
    db!.schema.raw(
      `SELECT setval('posts_id_seq', ${songData.posts.length + 1})`
    ),
  ]);

  const spotifySongs = await getSpotifySongs();
  for (const song of spotifySongs) {
    const id = await createSong(db!, song);
    await createPost(db!, {
      user_id: abe.id,
      song_id: id,
      created_at: song.created_at,
    });
  }

  // vinny's tape
  const mixtapeId = await createMixtapeForUser(vinny, {
    title: "vinny's mixtape",
  });

  await addSongToMixtape(mixtapeId, 1); // freebird
  await addSongToMixtape(mixtapeId, 3); // drive

  await publishMixtape(mixtapeId);
}
