import Vue from 'vue';
import _ from 'lodash';
import apiRequest from '../../apiRequest';
import {getPlaybackSourceName} from '../../playbackSources';

export const INITIAL_STATE = 'initial';
export const SEARCH_STATE = 'search';
export const CONFIRM_STATE = 'confirm';

function getNewAddSongTransaction() {
  return {
    state: INITIAL_STATE,

    shareLink: null,
    shareSource: null,
    shareSourceName: null,

    loadedShareLink: false,
    shareTitle: null,
    shareEmbeddable: null,

    searchResults: null,

    selectedSong: null,

    bandcampTrackId: null,
    soundcloudTrackId: null,

    manualEntry: false,
    manualEntrySuggestion: null,
    manualArtist: null,
    manualTitle: null,
  };
}

function getSubmitOptions(opts) {
  const source = opts.shareSource;

  let sourceDetails = {
    youtube: {
      youtubeUrl: opts.shareLink,
    },
    bandcamp: {
      bandcampTrackId: opts.bandcampTrackId,
      bandcampUrl: opts.shareLink,
    },
    soundcloud: {
      soundcloudTrackId: opts.soundcloudTrackId,
      soundcloudUrl: opts.shareLink,
    },
  }[source];

  return {
    source,
    artist: opts.manualArtist,
    title: opts.manualTitle,
    spotifyId: _.get(opts.selectedSong, 'spotifyId'),
    ...sourceDetails,
    ...(_.pick(opts, ['manualEntry', 'tweet', 'note'])),
  }
}

const addSong = {
  state() {
    return {
      showModal: false,
      ...getNewAddSongTransaction(),
    };
  },

  mutations: {
    resetTransaction(state) {
      Object.assign(state, getNewAddSongTransaction());
    },
    showModal(state) {
      state.showModal = true;
    },
    closeModal(state) {
      state.showModal = false;
    },
    loadedShareDetails(state, {url, details}) {
      state.shareLink = url;

      state.shareEmbeddable = details.embeddable;
      state.shareTitle = details.title;
      state.shareSource = details.source;
      state.shareSourceName = getPlaybackSourceName(details.source);

      if (details.spotify) {
        // go ahead and advance to the last screen
        state.selectedSong = details.spotify;
        state.state = CONFIRM_STATE;
      } else {
        state.state = SEARCH_STATE;
      }

      if (details.manualEntrySuggestion) {
        state.manualEntrySuggestion = details.manualEntrySuggestion;

        if (!details.spotify) {
          state.manualEntry = true;
        }
      }

      if (details.source === 'bandcamp') {
        state.bandcampTrackId = details.bandcampTrackId;

      } else if (details.source === 'soundcloud') {
        state.soundcloudTrackId = details.soundcloudTrackId;
      }
    },
    setManualEntry(state, {artist, title}) {
      state.manualArtist = artist;
      state.manualTitle = title;
      state.state = CONFIRM_STATE;
    },
    toggleManualEntry(state) {
      state.manualEntry = !state.manualEntry;
    },
    resetSearch(state) {
      state.searchResults = null;
    },
    loadedSearch(state, results) {
      state.searchResults = results;
    },
    selectSong(state, song) {
      state.selectedSong = song;
      state.state = CONFIRM_STATE;
    },
    unselectSong(state, song) {
      state.selectedSong = null;
      state.state = SEARCH_STATE;
    },
  },

  actions: {
    showAddSong(context) {
      context.commit('resetTransaction');
      context.commit('showModal');
    },
    closeAddSong(context) {
      context.commit('closeModal');
    },
    resetAddSong(context) {
      context.commit('resetTransaction');
    },
    toggleAddSongManualEntry(context) {
      context.commit('toggleManualEntry');
    },

    async submitSongLink(context, url) {
      const resp = await apiRequest(context, {
        url: '/share-details',
        method: 'GET',
        params: {url},
      });

      context.commit('loadedShareDetails', {url, details: resp.data});
    },

    submitManualEntry(context, {artist, title}) {
      context.commit('setManualEntry', {artist, title});
    },

    async addSongSearch(context, query) {
      context.commit('resetSearch');

      const resp = await apiRequest(context, {
        url: '/spotify-search',
        method: 'GET',
        params: {query},
      });

      context.commit('loadedSearch', resp.data.songs);
    },

    addSongSelectResult(context, song) {
      context.commit('selectSong', song);
    },
    addSongClearSelected(context) {
      context.commit('unselectSong');
    },

    async submitSong(context, {note, tweet}) {
      const params = getSubmitOptions({...context.state, note, tweet});

      const resp = await apiRequest(context, {
        url: '/playlist',
        method: 'POST',
        data: params,
      });

      const entry = resp.data;

      context.commit('addPlaylistEntries', [entry], {root: true});

      // Add the entry to the top of the user's feed
      context.commit('addPlaylistEntryToHead', {key: 'feed', entry}, {root: true});

      // Add the entry to the top of the user's playlist if they're on that page
      if (_.get(context.rootState.profile.user, 'name') === entry.user.twitterName) {
        context.commit('addPlaylistEntryToHead', {key: 'profilePosts', entry}, {root: true});
      }

      context.commit('closeModal');
    }
  },

  getters: {
    addSongArtist(state) {
      if (!(state.manualArtist || state.selectedSong)) {
        return null;
      }
      return state.manualEntry ? state.manualArtist : state.selectedSong.artists[0];
    },
    addSongTitle(state) {
      if (!(state.manualTitle || state.selectedSong)) {
        return null;
      }
      return state.manualEntry ? state.manualTitle : state.selectedSong.name;
    }
  },
};

export default addSong;