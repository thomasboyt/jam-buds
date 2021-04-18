<template>
  <div></div>
</template>

<script>
/* global MusicKit */
export default {
  computed: {
    usingAppleMusicWebPlayer() {
      const { supports, service, webPlayerEnabled } = this.$accessor.streaming;
      return (
        service === 'appleMusic' && webPlayerEnabled && supports.appleMusic
      );
    },
  },

  mounted() {
    if (this.$config.DISABLE_APPLE_MUSIC) {
      return;
    }

    if (MusicKit) {
      this.loaded();
    }

    document.addEventListener('musickitloaded', () => {
      this.loaded();
    });
  },

  methods: {
    loaded() {
      // MusicKit global is now defined
      MusicKit.configure({
        developerToken: this.$accessor.streaming.musicKitToken,
        app: {
          name: 'Jam Buds',
          build: '0.0.1',
        },
      });

      // if we're no longer authorized, disable apple music
      const music = MusicKit.getInstance();
      if (this.usingAppleMusicWebPlayer && !music.isAuthorized) {
        this.$accessor.streaming.unsetStreamingService();
      }
    },
  },
};
</script>
