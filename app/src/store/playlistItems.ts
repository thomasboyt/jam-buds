import { actionTree, mutationTree } from 'typed-vuex';
import Vue from 'vue';
import { createLike, deleteLike } from '~/api/likesApi';
import { ApiSchema } from '~/api/_helpers';

type ItemType = 'album' | 'song' | 'mixtape';
type LikeSource = 'post' | 'like' | 'mixtape';

type Song = ApiSchema<'SongWithMeta'>;
type Album = ApiSchema<'Album'>;
type Mixtape = ApiSchema<'MixtapePreview'>;
type FeedPlaylistEntry = ApiSchema<'FeedPlaylistEntry'>;
type UserPlaylistEntry = ApiSchema<'UserPlaylistEntry'>;
type PlaylistEntry = FeedPlaylistEntry | UserPlaylistEntry;

interface PlaylistItemsState {
  songs: Record<number, Song>;
  albums: Record<number, Album>;
  mixtapes: Record<number, Mixtape>;
}

const stateKey = (s: ItemType): 'albums' | 'songs' | 'mixtapes' => {
  if (s === 'album') {
    return 'albums';
  } else if (s === 'song') {
    return 'songs';
  } else if (s === 'mixtape') {
    return 'mixtapes';
  } else {
    throw new Error(`${s} was not a valid item type`);
  }
};

export const state = (): PlaylistItemsState => {
  return {
    albums: {},
    mixtapes: {},
    songs: {},
  };
};

export const mutations = mutationTree(state, {
  addMixtape(state, mixtape: Mixtape) {
    Vue.set(state.mixtapes, mixtape.id, mixtape);
  },

  removeMixtape(state, { mixtapeId }: { mixtapeId: number }) {
    Vue.delete(state.mixtapes, mixtapeId);
  },

  addMixtapes(state, mixtapes: Mixtape[]) {
    for (const mixtape of mixtapes) {
      Vue.set(state.mixtapes, mixtape.id, mixtape);
    }
  },

  addSongs(state, songs: Song[]) {
    for (const song of songs) {
      Vue.set(state.songs, song.id, song);
    }
  },

  // items = playlist/feed entries
  addPlaylistItems(state, items: PlaylistEntry[]) {
    const exists = <T>(item: T | undefined): item is T => !!item;
    const songs = items.map((item) => item.song).filter(exists);
    for (const song of songs) {
      Vue.set(state.songs, song.id, song);
    }
    const albums = items.map((item) => item.album).filter(exists);
    for (const album of albums) {
      Vue.set(state.albums, album.id, album);
    }
    const mixtapes = items.map((item) => item.mixtape).filter(exists);
    for (const mixtape of mixtapes) {
      Vue.set(state.mixtapes, mixtape.id, mixtape);
    }
  },

  markItemAsLiked(
    state,
    { itemType, itemId }: { itemType: ItemType; itemId: number }
  ) {
    const item = state[stateKey(itemType)][itemId];
    if (!item) {
      console.error(`No item stored for liked ${itemType} ${itemId}`);
      return;
    }
    item.meta!.isLiked = true;
    item.meta!.likeCount += 1;
  },

  markItemAsUnliked(
    state,
    { itemType, itemId }: { itemType: ItemType; itemId: number }
  ) {
    const item = state[stateKey(itemType)][itemId];
    if (!item) {
      console.error(`No item stored for unliked ${itemType} ${itemId}`);
      return;
    }
    item.meta!.isLiked = false;
    item.meta!.likeCount -= 1;
  },

  setMixtapeTitle(
    state,
    { mixtapeId, title }: { mixtapeId: number; title: string }
  ) {
    state.mixtapes[mixtapeId].title = title;
  },

  setMixtapeSlug(
    state,
    { mixtapeId, slug }: { mixtapeId: number; slug: string }
  ) {
    state.mixtapes[mixtapeId].slug = slug;
  },

  setMixtapePublished(state, { mixtapeId }: { mixtapeId: number }) {
    // Using vue.set because publishedAt is not present in returned mixtape
    // resource if the playlist isn't published yet, so Vue doesn't pick it
    // up w/r/t reactivity.
    Vue.set(state.mixtapes[mixtapeId], 'publishedAt', new Date().toISOString());
  },
});

export const actions = actionTree(
  { state, mutations },
  {
    async likeItem(
      context,
      {
        itemType,
        itemId,
        likeSource,
        sourceMixtapeId,
        sourceUserNames,
      }: {
        itemType: ItemType;
        itemId: number;
        likeSource: LikeSource;
        sourceMixtapeId?: number;
        sourceUserNames?: string[];
      }
    ): Promise<void> {
      const key = stateKey(itemType); // using the plural form on the endpoint for some reason...
      await createLike(this.$axios, key, itemId, {
        likeSource,
        sourceMixtapeId,
        sourceUserNames: sourceUserNames?.join(','),
      });

      context.commit('markItemAsLiked', { itemType, itemId });
    },

    async unlikeItem(
      context,
      { itemType, itemId }: { itemType: ItemType; itemId: number }
    ): Promise<void> {
      const key = stateKey(itemType); // using the plural form on the endpoint for some reason...
      await deleteLike(this.$axios, key, itemId);

      context.commit('markItemAsUnliked', { itemType, itemId });
    },

    async markSongPlayed(context, id: number): Promise<void> {
      await this.$axios({
        url: `/songs/${id}/listened`,
        method: 'PUT',
      });
    },
  }
);
