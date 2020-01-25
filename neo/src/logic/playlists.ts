import { Handle } from '@tboyt/jareth';
import { getAggregatedPostsForPublicFeed } from '../dal/feedDal';
import { getSongsByIds } from '../dal/songsDal';
import { getMixtapePreviewsByIds } from '../dal/mixtapesDal';
import { AggregatedPost, MixtapePreview, SongWithMeta } from '../dal/models';
import { jareth } from '../db';
import {
  SongResource,
  PlaylistSongItemResource,
  MixtapePreviewResource,
  PlaylistMixtapeItemResource,
  PlaylistResource,
} from '../resources';

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

async function getPlaylistItemsForPosts(
  handle: Handle,
  posts: AggregatedPost.Model[],
  currentUserId?: number | null
): Promise<
  (PlaylistSongItemResource.Interface | PlaylistMixtapeItemResource.Interface)[]
> {
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
      const item: PlaylistSongItemResource.Interface = {
        type: 'song',
        song: serializeSongResource(songsById[post.songId]),
        timestamp: post.timestamp.toISOString(),
        userNames: post.userNames,
      };
      return item;
    } else if (post.mixtapeId) {
      const item: PlaylistMixtapeItemResource.Interface = {
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

interface PublicFeedParams {
  limit: number;
  beforeTimestamp: Date | null;
  afterTimestamp: Date | null;
  currentUserId: number | null;
}

export async function getPublicFeed(
  params: PublicFeedParams
): Promise<PlaylistResource.Interface> {
  return jareth!.withHandle(async (handle) => {
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
  });
}
