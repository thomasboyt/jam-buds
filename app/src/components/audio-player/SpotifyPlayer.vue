<template>
  <div ref="container"></div>
</template>

<script>
import axios from 'axios';

let spotifyLoaded = false;
let spotifyPlayer = null;
let spotifyPlayerConnected = false;
let deviceId = null;

function loadSpotify() {
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

function connectPlayer(opts) {
  /* global Spotify */
  if (spotifyPlayerConnected) {
    return Promise.resolve();
  }

  if (!spotifyPlayer) {
    spotifyPlayer = new Spotify.Player({
      name: 'Jam Buds Player',
      getOAuthToken: opts.getOAuthToken,
    });
  }

  return new Promise(async (resolve, reject) => {
    spotifyPlayer.addListener('ready', ({ device_id }) => {
      console.log('ready!');
      deviceId = device_id;
      resolve();
    });

    spotifyPlayer.on('initialization_error', (err) => {
      console.error(err);
    });

    spotifyPlayer.on('authentication_error', (err) => {
      console.error(err);
    });

    spotifyPlayer.on('account_error', (err) => {
      console.error(err);
    });

    const connected = await spotifyPlayer.connect();

    if (!connected) {
      reject();
    }

    spotifyPlayerConnected = true;
  });
}

export default {
  props: ['spotifyId', 'isPlaying'],

  data() {
    return {
      ready: false,
    };
  },

  watch: {
    isPlaying(newVal) {
      if (!this.ready) {
        return;
      }

      if (!newVal) {
        // Pause
        spotifyPlayer.pause();
      } else {
        // Play
        spotifyPlayer.resume();
      }
    },

    spotifyId(newVal) {
      if (!this.ready) {
        return;
      }

      // Change songs
      this.setSong(newVal);
    },
  },

  async mounted() {
    // show loading indicator for song loading
    this.$emit('buffering');

    // 1. Load spotify CDN
    if (!spotifyLoaded) {
      await loadSpotify();

      spotifyLoaded = true;
    }

    // 2. Create and connect player
    if (!spotifyPlayerConnected) {
      await connectPlayer({
        getOAuthToken: async (cb) => {
          const token = await this.getOAuthToken();
          cb(token);
        },
      });
    }

    this.ready = true;

    this.setSong(this.spotifyId);

    spotifyPlayer.addListener('player_state_changed', (playbackState) => {
      if (!playbackState) {
        return;
      }

      // song ended: https://github.com/spotify/web-playback-sdk/issues/35#issuecomment-469834686
      if (
        playbackState.paused &&
        playbackState.position === 0 &&
        playbackState.restrictions.disallow_resuming_reasons &&
        playbackState.restrictions.disallow_resuming_reasons[0] === 'not_paused'
      ) {
        this.$emit('ended');
        return;
      }

      // TODO: if we use a newVal != oldVal strategy this could be busted? we
      // wouldn't want sync to cause updates here...
      //
      // store "last synced" state locally here, and compare locally? don't
      // update if same as last synced state? does that make sense? edge cases?
      // setting progress back to exactly what last synced was is one... unset
      // last synced state later? aaaaaaaaaaaaaa
      this.$store.dispatch('playback/sync', {
        isPaused: playbackState.paused,
        // position: playbackState.position,
      });

      // idea: if an "external" song gets played, break the player?
      if (playbackState.track_window.current_track.id !== this.spotifyId) {
        this.$emit('spotifyLostSync');
      }
    });
  },

  methods: {
    async setSong(spotifyId) {
      this.$emit('buffering');

      // TODO: avoid doing this round trip to the server every time
      const token = await this.getOAuthToken();

      await axios({
        url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        method: 'PUT',
        data: {
          uris: [`spotify:track:${spotifyId}`],
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.$emit('buffered');
    },

    async getOAuthToken() {
      const resp = await this.$axios({
        baseURL: null,
        url: '/auth/spotify-connect/token',
        method: 'GET',
      });

      return resp.data.token;
    },
  },
};
</script>
