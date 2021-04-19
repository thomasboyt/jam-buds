import Vue from 'vue';
import { getterTree, mutationTree, actionTree } from 'typed-vuex';
import { ApiSchema } from '~/api/_helpers';

type SongWithMeta = ApiSchema<'SongWithMeta'>;
type MixtapePreview = ApiSchema<'MixtapePreview'>;
type MixtapeWithSongsReponse = ApiSchema<'MixtapeWithSongsReponse'>;
type UserProfile = ApiSchema<'UserProfile'>;

export interface MixtapeHydrated extends MixtapePreview {
  tracks: number[];
  author: UserProfile;
}

interface MixtapesState {
  tracksByMixtapeId: Record<number, number[]>;
  draftMixtapes: MixtapePreview[];
}

export const state = (): MixtapesState => {
  return {
    tracksByMixtapeId: {},
    draftMixtapes: [],
  };
};

export const getters = getterTree(state, {
  getMixtape(
    state,
    getters,
    rootState
  ): (key: number) => MixtapeHydrated | null {
    return (key: number) => {
      const mixtape = rootState.playlistItems.mixtapes[key] as
        | MixtapePreview
        | undefined;

      if (!mixtape) {
        return null;
      }

      return {
        ...mixtape,
        tracks: state.tracksByMixtapeId[key],
        author: rootState.profile.profiles[mixtape.authorName],
      };
    };
  },
});

export const mutations = mutationTree(state, {
  setMixtapeSongs(state, data: MixtapeWithSongsReponse) {
    const trackIds = data.tracks.map((song) => song.id);
    Vue.set(state.tracksByMixtapeId, data.mixtape.id, trackIds);
  },

  setMixtapeOrder(
    state,
    { mixtapeId, songOrder }: { mixtapeId: number; songOrder: number[] }
  ) {
    Vue.set(state.tracksByMixtapeId, mixtapeId, songOrder);
  },

  appendToMixtape(
    state,
    { songId, mixtapeId }: { songId: number; mixtapeId: number }
  ) {
    const newTracks = state.tracksByMixtapeId[mixtapeId].concat([songId]);
    Vue.set(state.tracksByMixtapeId, mixtapeId, newTracks);
  },

  removeFromMixtape(
    state,
    { songId, mixtapeId }: { songId: number; mixtapeId: number }
  ) {
    const newTracks = state.tracksByMixtapeId[mixtapeId].filter(
      (mixtapeSongId) => mixtapeSongId !== songId
    );
    Vue.set(state.tracksByMixtapeId, mixtapeId, newTracks);
  },

  removeMixtape(state, { mixtapeId }: { mixtapeId: number }) {
    Vue.delete(state.tracksByMixtapeId, mixtapeId);
  },

  setDraftMixtapes(state, mixtapes: MixtapePreview[]) {
    state.draftMixtapes = mixtapes;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async loadMixtape(context, id: number): Promise<MixtapeWithSongsReponse> {
      const resp = await this.$axios({
        url: `/mixtapes/${id}`,
        method: 'GET',
      });
      const data = resp.data as MixtapeWithSongsReponse;

      this.app.$accessor.playlistItems.addSongs(data.tracks);
      context.commit('setMixtapeSongs', data);
      this.app.$accessor.playlistItems.addMixtape(data.mixtape);
      this.app.$accessor.profile.addProfiles([data.author]);

      return resp.data;
    },

    addSongToMixtape(
      context,
      { mixtapeId, song }: { mixtapeId: number; song: SongWithMeta }
    ): void {
      this.app.$accessor.playlistItems.addSongs([song]);
      context.commit('appendToMixtape', { songId: song.id, mixtapeId });
    },

    async removeSongFromMixtape(
      context,
      { mixtapeId, songId }: { mixtapeId: number; songId: number }
    ): Promise<void> {
      await this.$axios({
        url: `/mixtapes/${mixtapeId}/songs/${songId}`,
        method: 'DELETE',
      });

      context.commit('removeFromMixtape', { mixtapeId, songId });
    },

    async updateMixtapeSongOrder(
      context,
      { mixtapeId, songOrder }: { mixtapeId: number; songOrder: number[] }
    ): Promise<void> {
      // TODO: maybe prevent race conditions here?
      const prevOrder = context.state.tracksByMixtapeId[mixtapeId];
      context.commit('setMixtapeOrder', { mixtapeId, songOrder });

      try {
        await this.$axios({
          method: 'POST',
          url: `/mixtapes/${mixtapeId}/order`,
          data: { songOrder },
        });
      } catch (err) {
        context.commit('setMixtapeOrder', { mixtapeId, songOrder: prevOrder });
        throw err;
      }
    },

    async renameMixtape(
      context,
      { mixtapeId, title }: { mixtapeId: number; title: string }
    ): Promise<void> {
      const prevTitle = this.app.$accessor.playlistItems.mixtapes[mixtapeId]
        .title;
      this.app.$accessor.playlistItems.setMixtapeTitle({ mixtapeId, title });

      try {
        const resp = await this.$axios({
          method: 'POST',
          url: `/mixtapes/${mixtapeId}/title`,
          data: { title },
        });

        const data = resp.data as ApiSchema<'RenameMixtapeResponse'>;

        this.app.$accessor.playlistItems.setMixtapeSlug({
          mixtapeId,
          slug: data.newSlug,
        });
      } catch (err) {
        this.app.$accessor.playlistItems.setMixtapeTitle({
          mixtapeId,
          title: prevTitle,
        });
        throw err;
      }
    },

    async publishMixtape(
      context,
      { mixtapeId }: { mixtapeId: number }
    ): Promise<void> {
      await this.$axios({
        method: 'POST',
        url: `/mixtapes/${mixtapeId}/publish`,
      });

      this.app.$accessor.playlistItems.setMixtapePublished({ mixtapeId });
    },

    async deleteMixtape(
      context,
      { mixtapeId }: { mixtapeId: number }
    ): Promise<void> {
      await this.$axios({
        method: 'DELETE',
        url: `/mixtapes/${mixtapeId}`,
      });

      // XXX: This doesn't commit removeMixtape because the mixtape page needs
      // to be navigated away from before we clear that cache, see
      // <mixtape-page />
    },

    removeMixtapeFromCache(
      context,
      { mixtapeId }: { mixtapeId: number }
    ): void {
      context.commit('removeMixtape', { mixtapeId });
      this.app.$accessor.playlistItems.removeMixtape({ mixtapeId });
      this.app.$accessor.playlist.deleteOwnPlaylistMixtape({
        mixtapeId,
      });
    },

    async loadDraftMixtapes(context): Promise<void> {
      const resp = await this.$axios({
        url: `/draft-mixtapes`,
        method: 'GET',
      });

      const data = resp.data as ApiSchema<'GetDraftMixtapesResponse'>;

      context.commit('setDraftMixtapes', data.mixtapes);
      this.app.$accessor.playlistItems.addMixtapes(data.mixtapes);
    },
  }
);
