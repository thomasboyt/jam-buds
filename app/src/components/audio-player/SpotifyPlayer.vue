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
