<template>
  <div>
    <div class="connect-page">
      <h3>connect your accounts</h3>

      <spotify-connect redirect="/welcome/colors" />

      <p>
        (no streaming? no problem; just click the youtube button on a song to
        search for it)
      </p>
    </div>
  </div>
</template>

<script>
import SpotifyConnect from '../../components/settings/SpotifyConnect.vue';

export default {
  components: { SpotifyConnect },
};
</script>

<style lang="scss" scoped>
.connect-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;

  --theme-link-color: black;
}

h3 {
  font-size: 32px;
  line-height: 1em;
  margin-bottom: 24px;
  font-weight: normal;
}
</style>
