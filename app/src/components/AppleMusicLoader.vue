<template>
  <div></div>
</template>

<script>
/* global MusicKit */
export default {
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
        developerToken: this.$store.state.streaming.musicKitToken,
        app: {
          name: 'Jam Buds',
          build: '0.0.1',
        },
      });

      const music = MusicKit.getInstance();
      this.$store.commit('loadedAppleMusic', music.isAuthorized);
    },
  },
};
</script>
