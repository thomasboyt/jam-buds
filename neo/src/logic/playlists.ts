import { Handle } from '@tboyt/jareth';
import {
  getAggregatedPostsForPublicFeed,
  getAggregatedPostsForUserFeed,
} from '../dal/feedDal';
import { getSongsByIds } from '../dal/songsDal';
import { getMixtapePreviewsByIds } from '../dal/mixtapesDal';
import {
  AggregatedPost,
  MixtapePreview,
  SongWithMeta,
  UserPost,
} from '../dal/models';
import {
  SongResource,
  MixtapePreviewResource,
  UserPlaylistSongItemResource,
  UserPlaylistMixtapeItemResource,
  UserPlaylistResource,
  FeedSongItemResource,
  FeedMixtapeItemResource,
  FeedResource,
} from '../resources';
import { getPostsForUser, getLikedPostsForUser } from '../dal/playlistsDal';

function serializeSongResource(
  song: SongWithMeta.Model
): SongResource.Interface {
  return {
    ...song,
    likeCount: parseInt(song.likeCount),
  };
}

function serializeMixtapePreview(
  mixtape: MixtapePreview.Model
): MixtapePreviewResource.Interface {
  return {
    authorName: mixtape.authorName,
    id: mixtape.id,
    numTracks: parseInt(mixtape.songCount),
    slug: mixtape.slug,
    title: mixtape.title,
  };
}

// TODO: pull this into a util file
// via https://github.com/microsoft/TypeScript/issues/16069#issuecomment-557570094
function isNotNull<T>(it: T): it is NonNullable<T> {
  return it != null;
}

type FeedItem =
  | FeedSongItemResource.Interface
  | FeedMixtapeItemResource.Interface;

type PlaylistItem =
  | UserPlaylistSongItemResource.Interface
  | UserPlaylistMixtapeItemResource.Interface;

async function getPlaylistItemsForPosts(
  handle: Handle,
  posts: AggregatedPost.Model[],
  currentUserId?: number | null
): Promise<FeedItem[]>;

async function getPlaylistItemsForPosts(
  handle: Handle,
  posts: UserPost.Model[],
  currentUserId?: number | null
): Promise<PlaylistItem[]>;

async function getPlaylistItemsForPosts(
  handle: Handle,
  posts: AggregatedPost.Model[],
  currentUserId?: number | null
): Promise<PlaylistItem[]> {
  const songIds = posts.map((post) => post.songId).filter(isNotNull);
  const songs = await getSongsByIds(handle, {
    currentUserId: currentUserId || -1,
    songIds,
  });
  const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));

  const mixtapeIds = posts.map((post) => post.mixtapeId).filter(isNotNull);
  const mixtapes = await getMixtapePreviewsByIds(handle, {
    mixtapeIds,
  });
  const mixtapesById = Object.fromEntries(
    mixtapes.map((mixtape) => [mixtape.id, mixtape])
  );

  return posts.map((post) => {
    if (post.songId) {
      if (post.userNames) {
        const item: FeedSongItemResource.Interface = {
          type: 'song',
          song: serializeSongResource(songsById[post.songId]),
          timestamp: post.timestamp.toISOString(),
          userNames: post.userNames,
        };
        return item;
      } else {
        const item: UserPlaylistSongItemResource.Interface = {
          type: 'song',
          song: serializeSongResource(songsById[post.songId]),
          timestamp: post.timestamp.toISOString(),
        };
        return item;
      }
    } else if (post.mixtapeId) {
      // XXX: feed and user playlist resources are currently the same so this is
      // fine
      const item: UserPlaylistMixtapeItemResource.Interface = {
        mixtape: serializeMixtapePreview(mixtapesById[post.mixtapeId]),
        type: 'mixtape',
        timestamp: post.timestamp.toISOString(),
      };
      return item;
    } else {
      throw new Error('could not match song to mixtape or post');
    }
  });
}

interface PlaylistParams {
  limit: number;
  beforeTimestamp: Date | null;
  afterTimestamp: Date | null;
  currentUserId: number | null;
}
export async function getPublicFeed(
  handle: Handle,
  params: PlaylistParams
): Promise<FeedResource.Interface> {
  const posts = await getAggregatedPostsForPublicFeed(handle, params);
  const items = await getPlaylistItemsForPosts(
    handle,
    posts,
    params.currentUserId
  );

  return {
    items,
    limit: params.limit,
  };
}

interface UserFeedParams extends PlaylistParams {
  currentUserId: number;
}
export async function getUserFeed(
  handle: Handle,
  params: UserFeedParams
): Promise<FeedResource.Interface> {
  const posts = await getAggregatedPostsForUserFeed(handle, params);
  const items = await getPlaylistItemsForPosts(
    handle,
    posts,
    params.currentUserId
  );

  return {
    items,
    limit: params.limit,
  };
}

export async function getUserPlaylist(
  handle: Handle,
  userId: number,
  params: PlaylistParams
): Promise<UserPlaylistResource.Interface> {
  const posts = await getPostsForUser(handle, {
    userId,
    afterTimestamp: params.afterTimestamp,
    beforeTimestamp: params.beforeTimestamp,
    limit: params.limit,
  });

  const items = await getPlaylistItemsForPosts(
    handle,
    posts,
    params.currentUserId
  );

  return {
    items,
    limit: params.limit,
  };
}

export async function getUserLikedPlaylist(
  handle: Handle,
  userId: number,
  params: PlaylistParams
): Promise<UserPlaylistResource.Interface> {
  const posts = await getLikedPostsForUser(handle, {
    userId,
    afterTimestamp: params.afterTimestamp,
    beforeTimestamp: params.beforeTimestamp,
    limit: params.limit,
  });

  const items = await getPlaylistItemsForPosts(
    handle,
    posts,
    params.currentUserId
  );

  return {
    items,
    limit: params.limit,
  };
}
