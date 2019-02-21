<template>
  <settings-button tag="a" :href="twitterConnectLink"
    >connect to twitter</settings-button
  >
</template>

<script>
import SettingsButton from './SettingsButton.vue';

export default {
  components: { SettingsButton },

  props: ['redirect'],

  computed: {
    twitterConnectLink() {
      return `/auth/twitter-connect?redirect=${this.redirect}`;
    },
  },
};
</script>
