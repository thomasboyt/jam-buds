<template>
  <div></div>
</template>

<script>
// TODO: This component should potentially actually load the Spotify SDK if
// `checkSpotifyConnection` comes back true, so that first play time is faster
export default {
  mounted() {
    this.$accessor.streaming.checkSpotifyConnection();
  },
};
</script>
