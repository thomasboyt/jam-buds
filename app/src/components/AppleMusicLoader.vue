<template>
  <div></div>
</template>

<script>
/* global MusicKit */
export default {
  mounted() {
    if (process.env.DISABLE_APPLE_MUSIC) {
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
        // see webpack/base.js
        developerToken: process.env.MUSICKIT_AUTH_TOKEN,
        app: {
          name: 'Jam Buds',
          build: '0.0.1',
        },
      });

      const music = MusicKit.getInstance();
      if (music.isAuthorized) {
        this.$store.commit('authorizedAppleMusic');
      }
    },
  },
};
</script>
