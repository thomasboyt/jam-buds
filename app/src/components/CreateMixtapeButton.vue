<template>
  <add-song-button @click="handleCreateMixtape" :disabled="requestInFlight">
    + new mixtape
  </add-song-button>
</template>

<script>
import AddSongButton from './AddSongButton.vue';

export default {
  components: { AddSongButton },

  data() {
    return {
      requestInFlight: false,
    };
  },

  methods: {
    async handleCreateMixtape() {
      this.requestInFlight = true;

      let resp;
      try {
        resp = await this.$axios({
          url: '/mixtapes',
          method: 'POST',
          data: { title: 'New Mixtape' },
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      const { id, slug } = resp.data;
      this.$router.push(`/mixtapes/${id}/${slug}`);
    },
  },
};
</script>
