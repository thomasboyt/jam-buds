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
  }

  play() {
    console.log('resuming');
    this._spotifyPlayer.resume();
  }

  pause() {
    console.log('pausing');
    this._spotifyPlayer.pause();
  }

  async setSong(song) {
    this.store.dispatch('playback/sync', {
      isBuffering: true,
    });

    const token = await this._getOAuthToken();

    await axios({
      url: `https://api.spotify.com/v1/me/player/play?device_id=${
        this._deviceId
      }`,
      method: 'PUT',
      data: {
        uris: [`spotify:track:${song.spotifyId}`],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.store.dispatch('playback/sync', {
      isBuffering: false,
    });
  }

  async initialize() {
    // let's try to load spotify!!
    // 1. Load spotify SDK
    if (!spotifySDKLoaded) {
      await loadSpotifySDK();

      spotifySDKLoaded = true;
    }

    // 2. Create and connect player
    await this._createAndReadyPlayer();

    this._spotifyPlayer.addListener('player_state_changed', (state) =>
      this.onPlaybackStateChange(state)
    );
  }

  async _createAndReadyPlayer() {
    this._spotifyPlayer = new Spotify.Player({
      name: 'Jam Buds Player',
      getOAuthToken: async (cb) => {
        const token = await this._getOAuthToken();
        cb(token);
      },
    });

    return new Promise(async (resolve, reject) => {
      this._spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('ready!');
        this._deviceId = device_id;
        resolve();
      });

      this._spotifyPlayer.on('initialization_error', (err) => {
        console.error(err);
        reject();
      });

      this._spotifyPlayer.on('authentication_error', (err) => {
        console.error(err);
        reject();
      });

      this._spotifyPlayer.on('account_error', (err) => {
        console.error(err);
        reject();
      });

      const connected = await this._spotifyPlayer.connect();

      if (!connected) {
        reject();
      }
    });
  }

  async _getOAuthToken() {
    if (this._token) {
      return this._token;
    }

    const resp = await this.store.$axios({
      baseURL: null,
      url: '/auth/spotify-connect/token',
      method: 'GET',
    });

    this._token = resp.data.token;
    return this._token;
  }

  onPlaybackStateChange(state) {
    console.log(state);
    if (!state) {
      return;
    }

    // song ended: https://github.com/spotify/web-playback-sdk/issues/35#issuecomment-469834686
    if (
      state.paused &&
      state.position === 0 &&
      state.restrictions.disallow_resuming_reasons &&
      state.restrictions.disallow_resuming_reasons[0] === 'not_paused'
    ) {
      // TODO: do something to ensure this is not fired for a newly played
      // song...
      // this.$emit('ended');
      return;
    }

    const syncState = {
      isPlaying: !state.paused,
    };
    console.log('syncing', syncState);
    this.store.dispatch('playback/sync', syncState);

    // idea: if an "external" song gets played, break the player?
    // if (state.track_window.current_track.id !== this.spotifyId) {
    //   this.$emit('spotifyLostSync');
    // }
  }
}
