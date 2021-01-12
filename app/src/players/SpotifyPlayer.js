/* global Spotify */

import axios from 'axios';

let spotifySDKLoaded = false;

/**
 * Load the Spotify SDK in the page, resolving a promise when loaded.
 */
function loadSpotifySDK() {
  const readyPromise = new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = resolve;
  });

  if (document.getElementById('spotify-player-script')) {
    // we're already loading, no need to append the script
    return readyPromise;
  }

  const script = document.createElement('script');
  script.id = 'spotify-player-script';
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  document.body.appendChild(script);

  return readyPromise;
}

export default class SpotifyPlayer {
  constructor({ store }) {
    this._spotifyReady = false;
    this._spotifyPlayer = null;
    this.store = store;

    // hacky hack
    this.trackStarted = false;
  }

  play() {
    console.log('resuming');
    this._spotifyPlayer.resume();
  }

  pause() {
    console.log('pausing');
    this._spotifyPlayer.pause();
  }

  setVolume(volume) {
    this._spotifyPlayer.setVolume(volume);
  }

  async setSong(song) {
    this.trackStarted = false;

    this.store.dispatch('playback/sync', {
      isBuffering: true,
    });

    const token = await this._getOAuthToken();

    try {
      await axios({
        url: `https://api.spotify.com/v1/me/player/play?device_id=${this._deviceId}`,
        method: 'PUT',
        data: {
          uris: [`spotify:track:${song.spotifyId}`],
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      if (err.response?.data?.error?.reason === 'PREMIUM_REQUIRED') {
        this.store.commit(
          'showErrorModal',
          'A premium Spotify account is required for playback, sorry :('
        );
        this.store.commit('playback/clearPlayback');
        this.store.dispatch('unsetStreamingService');
        return;
      }
      this.store.commit(
        'showErrorModal',
        'An unknown error occurred trying to play back music'
      );
      throw err; // throw error for logging
    }

    this.store.dispatch('playback/sync', {
      isBuffering: false,
    });
  }

  async initialize({ initialVolume }) {
    // let's try to load spotify!!
    // 1. Load spotify SDK
    if (!spotifySDKLoaded) {
      await loadSpotifySDK();

      spotifySDKLoaded = true;
    }

    // 2. Create and connect player
    await this._createAndReadyPlayer(initialVolume);

    this._spotifyPlayer.addListener('player_state_changed', (state) =>
      this.onPlaybackStateChange(state)
    );
  }

  async _createAndReadyPlayer(initialVolume) {
    this._spotifyPlayer = new Spotify.Player({
      name: 'Jam Buds Player',
      getOAuthToken: async (cb) => {
        const token = await this._getOAuthToken();
        cb(token);
      },
      volume: initialVolume,
    });

    // TODO: maybe refactor this
    /* eslint-disable no-async-promise-executor */
    return new Promise(async (resolve, reject) => {
      this._spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('ready!');
        this._deviceId = device_id;
        resolve();
      });

      this._spotifyPlayer.on('initialization_error', (err) => {
        console.error(err);
        reject(err);
      });

      this._spotifyPlayer.on('authentication_error', (err) => {
        console.error(err);
        reject(err);
      });

      this._spotifyPlayer.on('account_error', (err) => {
        console.error(err);
        reject(err);
      });

      const connected = await this._spotifyPlayer.connect();

      if (!connected) {
        reject();
      }
    });
  }

  async _getOAuthToken() {
    if (this._token) {
      if (this._tokenExpiresAtMs > Date.now()) {
        return this._token;
      }
    }

    const resp = await this.store.$axios({
      url: '/spotify-token',
      method: 'GET',
      // pull anonymous auth token out of cookie
      withCredentials: true,
    });

    if (!resp.data.spotifyConnected) {
      // TODO: handle this better
      alert('Lost connection to Spotify!');
      throw Error('Lost connection to Spotify');
    }

    this._token = resp.data.accessToken;
    this._tokenExpiresAtMs = resp.data.expiresAtMs;
    return this._token;
  }

  onPlaybackStateChange(state) {
    if (!state) {
      return;
    }

    // song ended: https://github.com/spotify/web-playback-sdk/issues/35#issuecomment-469834686
    if (
      this.trackStarted &&
      state.paused &&
      state.position === 0 &&
      state.restrictions.disallow_resuming_reasons &&
      state.restrictions.disallow_resuming_reasons[0] === 'not_paused' &&
      state.track_window.previous_tracks.find(
        (x) => x.id === state.track_window.current_track.id
      )
    ) {
      this.trackStarted = false;
      this.store.dispatch('playback/nextSong');
      return;
    }

    this.trackStarted = true;

    const syncState = {
      isPlaying: !state.paused,
      secondsElapsed: Math.floor(state.position / 1000),
      secondsTotal: Math.ceil(state.duration / 1000),
    };
    console.log('syncing', syncState);
    this.store.dispatch('playback/sync', syncState);

    // idea: if an "external" song gets played, break the player?
    // if (state.track_window.current_track.id !== this.spotifyId) {
    //   this.$emit('spotifyLostSync');
    // }
  }
}
