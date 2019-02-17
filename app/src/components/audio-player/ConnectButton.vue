<template>
  <a class="button connect-button" :href="spotifyConnectLink">
    Connect to Spotify!
  </a>
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
$spotify-bright-green: #1ed760;

a.connect-button {
  color: white;
  border: 3px $spotify-bright-green solid;

  &:visited {
    color: white;
  }

  padding: 15px 25px;
  text-decoration: none;
}
</style>
