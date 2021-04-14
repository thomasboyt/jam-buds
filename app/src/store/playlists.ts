import Vue from 'vue';
import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type Timestamp = number; // TODO: should be string
type FeedPlaylistEntry = ApiSchema<'FeedPlaylistEntry'>;
type UserPlaylistEntry = ApiSchema<'UserPlaylistEntry'>;
type PlaylistEntry = FeedPlaylistEntry | UserPlaylistEntry;
type PlaylistResponse =
  | ApiSchema<'UserPlaylistResponse'>
  | ApiSchema<'FeedPlaylistResponse'>;

const mixtapeKey = (id: number) => `mixtape:${id}`;

export interface DenormalizedItem {
  id: string;
  timestamp: Timestamp;
  songId?: number;
  albumId?: number;
  mixtapeId?: number;

  // FeedPlaylistEntry
  posts?: ApiSchema<'FeedPlaylistPost'>[];
  // UserPlaylistEntry
  postId?: number;
  noteText?: string;
}

function denormalizeItem(entry: PlaylistEntry): DenormalizedItem {
  let id;
  if (entry.type === 'song') {
    id = `song:${entry.song!.id}`;
  } else if (entry.type === 'album') {
    id = `album:${entry.album!.id}`;
  } else {
    id = `mixtape:${entry.mixtape!.id}`;
  }

  const denormalizedItem = {
    ...entry,
    songId: entry.song?.id,
    albumId: entry.album?.id,
    mixtapeId: entry.mixtape?.id,
    id,
  };

  delete denormalizedItem.song;
  delete denormalizedItem.mixtape;
  delete denormalizedItem.album;

  return denormalizedItem;
}

export interface Playlist {
  items: DenormalizedItem[];
  itemsExhausted: boolean;
  url: string;
  hasLoadedInitialItems: boolean;
}

type PlaylistsState = Record<string, Playlist>;

export const state = (): PlaylistsState => {
  return {};
};

export const getters = getterTree(state, {
  getPlaylist(state): (key: string) => DenormalizedItem[] {
    return (key) => {
      const playlist = state[key];
      if (!playlist) {
        throw new Error(`undefined playlist ${key}`);
      }

      return playlist.items;
    };
  },
});

export const mutations = mutationTree(state, {
  initializePlaylist(state, { key, url }: { key: string; url: string }) {
    const playlist: Playlist = {
      items: [],
      itemsExhausted: false,
      url,
      /** whether we've successfully tried to load at least one page */
      hasLoadedInitialItems: false,
    };
    Vue.set(state, key, playlist);
  },

  addToPlaylistHead(
    state,
    { key, items }: { key: string; items: PlaylistEntry[] }
  ) {
    const denormalizedItems = items.map((entry) => denormalizeItem(entry));

    // if a playlist item we've already loaded "reappears" further up in the
    // feed, we need to remove it from its old spot
    //
    // this happens if the current user posts a song that was already in their
    // feed, or when the feed is refreshed due to fuzziness in the after=
    // param
    //
    // XXX: This is like O(n^2)-ish but probably fine
    for (const newItem of denormalizedItems) {
      for (const existingItem of state[key].items) {
        if (newItem.id === existingItem.id) {
          state[key].items = state[key].items.filter(
            (playlistItem) => playlistItem.id !== newItem.id
          );
        }
      }
    }

    state[key].items = [...denormalizedItems, ...state[key].items];
  },

  /**
   * Append a new page of items to a playlist.
   */
  pushPlaylist(state, { key, page }: { key: string; page: PlaylistResponse }) {
    state[key].hasLoadedInitialItems = true;

    const items = page.items.map(denormalizeItem);
    state[key].items = state[key].items.concat(items);
    if (page.items.length < page.limit) {
      state[key].itemsExhausted = true;
    }
  },

  deletedPost(state, { id }: { id: number }) {
    // After you delete a post, remove the post from any playlist, including
    // aggregate items where yours was the only post
    for (const key of Object.keys(state)) {
      const existingIdx = state[key].items.findIndex(
        (entry) =>
          entry.postId === id || entry.posts?.find((post) => post.postId === id)
      );

      if (existingIdx !== -1) {
        const items = state[key].items.slice();
        const posts = items[existingIdx].posts;

        if (!posts || posts.length === 1) {
          // remove this post since it's the only post
          items.splice(existingIdx, 1);
        } else {
          items[existingIdx].posts = posts.filter((post) => post.postId !== id);
        }

        state[key].items = items;
      }
    }
  },

  deleteOwnPlaylistMixtape(state, { mixtapeId }: { mixtapeId: number }) {
    for (const key of Object.keys(state)) {
      const existingIdx = state[key].items.findIndex(
        (entry) => entry.id === mixtapeKey(mixtapeId)
      );
      if (existingIdx !== -1) {
        const items = state[key].items.slice();
        items.splice(existingIdx, 1);
        state[key].items = items;
      }
    }
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async loadPlaylist(
      context,
      { key, url }: { key: string; url: string }
    ): Promise<PlaylistResponse> {
      // XXX: This returns resp.data so profile store can pick up the "current
      // profile" from it
      if (context.state[key]) {
        // refresh top of playlist
        return await context.dispatch('loadNewPlaylistEntries', { key });
      } else {
        context.commit('initializePlaylist', { key, url });
        return await context.dispatch('loadNextPlaylistPage', { key });
      }
    },

    async loadNextPlaylistPage(
      context,
      { key }: { key: string }
    ): Promise<PlaylistResponse> {
      if (!context.state[key]) {
        throw new Error(`undefined playlist ${key}`);
      }

      const previousItem = context.state[key].items.slice(-1)[0];
      const previousTimestamp = previousItem
        ? previousItem.timestamp
        : undefined;

      const resp = await this.$axios({
        url: context.state[key].url,
        method: 'GET',
        params: { before: previousTimestamp },
      });
      const data = resp.data as PlaylistResponse;

      context.dispatch('addPlaylistResources', data);
      context.commit('pushPlaylist', { key, page: data });

      return resp.data;
    },

    async loadNewPlaylistEntries(
      context,
      { key }: { key: string }
    ): Promise<PlaylistResponse> {
      const firstItem = context.state[key].items[0];
      const afterTimestamp = firstItem ? firstItem.timestamp : undefined;

      const resp = await this.$axios({
        url: context.state[key].url,
        method: 'GET',
        params: { after: afterTimestamp },
      });
      const data = resp.data as PlaylistResponse;

      context.dispatch('addPlaylistResources', data);
      context.commit('addToPlaylistHead', { key, items: data.items });

      return resp.data;
    },

    addPlaylistResources(context, page: PlaylistResponse): void {
      this.app.$accessor.playlistItems.addPlaylistItems(page.items);
      this.app.$accessor.profiles.addProfiles(page.profiles);
    },

    async loadProfilePostsPlaylist(context, userName: string): Promise<void> {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/posts`,
        url: `/playlists/${userName}`,
      });
    },

    async loadProfileLikesPlaylist(context, userName: string): Promise<void> {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/likes`,
        url: `/playlists/${userName}/liked`,
      });
    },

    async loadProfileMixtapes(context, userName: string): Promise<void> {
      await context.dispatch('loadPlaylist', {
        key: `${userName}/mixtapes`,
        url: `/playlists/${userName}?onlyMixtapes=true`,
      });
    },

    async deletePost(context, { id }: { id: number }): Promise<void> {
      await this.$axios({
        url: `/posts/${id}`,
        method: 'DELETE',
      });
      context.commit('deletedPost', { id });
    },
  }
);
