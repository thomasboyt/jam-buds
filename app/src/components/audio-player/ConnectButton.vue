<template>
  <router-link class="button connect-button" to="/settings">
    Connect to Spotify or Apple!
  </router-link>
</template>

<script>
export default {
  computed: {
    spotifyConnectLink() {
      const redirect = this.$route.path;
      return `/auth/spotify-connect?redirect=${redirect}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/mixins.scss';
$spotify-bright-green: #1ed760;

a.connect-button {
  color: white;
  border: 3px $spotify-bright-green solid;

  &:visited {
    color: white;
  }

  padding: 15px 25px;
  text-decoration: none;

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
