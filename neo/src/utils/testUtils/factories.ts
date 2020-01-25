import { Handle } from '@tboyt/jareth';

const mapNumber = (val: unknown) => {
  if (typeof val === 'number') {
    return val;
  } else {
    throw new Error('invalid number');
  }
};

export function createUser(
  handle: Handle,
  { name, showInPublicFeed }: { name: string; showInPublicFeed: boolean }
) {
  return handle
    .createQuery(
      'insert into users (name, show_in_public_feed, email) values (${name}, ${showInPublicFeed}, ${email}) returning *'
    )
    .one({ name, showInPublicFeed, email: `${name}@jambuds.club` }, (row) =>
      mapNumber(row.id)
    );
}

export function createSong(handle: Handle) {
  return handle
    .createQuery(
      'insert into songs (title, artists) values (${title}, ${artists}) returning *'
    )
    .one({ title: 'song title', artists: ['artist name'] }, (row) =>
      mapNumber(row.id)
    );
}

export function createSongPost(
  handle: Handle,
  { userId, songId }: { userId: number; songId: number }
) {
  return handle
    .createQuery(
      'insert into posts (user_id, song_id) values (${userId}, ${songId})'
    )
    .none({ userId, songId });
}
