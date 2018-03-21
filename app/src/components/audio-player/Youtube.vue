<template>
  <div ref="container"/>
</template>

<script>
/* global YT */

import queryString from 'query-string';

/**
 * Yo!!!
 * This component uses a SINGLETON hidden Youtube player for playback. There can be multiple instances of it, but it's only ever gonna use the one player.
 */

let ytPlayer = null;
let ytPlayerReady = false;

if (process.env.VUE_ENV === 'client') {
  if (window.YT && YT.Player) {
    setupYoutube();
  } else {
    window.onYouTubeIframeAPIReady = setupYoutube;
  }
}

function setupYoutube() {
  const tub = document.createElement('div');
  document.body.appendChild(tub);

  ytPlayer = new YT.Player(tub, {
    width: '0',
    height: '0',

    playerVars: {
      playsinline: '1',
    },

    events: {
      onReady: (e) => (ytPlayerReady = true),
    },
  });
}

function getVideoId(url) {
  const qs = queryString.parse(queryString.extract(url));
  return qs['v'];
}

export default {
  props: ['url', 'isPlaying'],

  watch: {
    isPlaying(newVal, oldVal) {
      if (!newVal) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    },

    url(newVal, oldVal) {
      const id = getVideoId(newVal);
      ytPlayer.loadVideoById(id);
    },
  },

  mounted() {
    if (!ytPlayer || !ytPlayerReady) {
      // TODO: Handle Youtube player not being loaded yet!!
      throw new Error('no player present');
    }

    ytPlayer.loadVideoById(getVideoId(this.url));

    if (this.isPlaying) {
      ytPlayer.playVideo();
    }

    ytPlayer.addEventListener('onStateChange', this.onStateChange);
  },

  beforeDestroy() {
    if (!ytPlayer) {
      return;
    }

    ytPlayer.stopVideo();
    ytPlayer.removeEventListener('onStateChange', this.onStateChange);
  },

  methods: {
    onStateChange(evt) {
      if (evt.data === YT.PlayerState.ENDED) {
        this.$emit('ended');
      }
    },
  },
};
</script>
