<template>
  <div
    class="confirm-screen"
    :style="{ minHeight: '100%', display: 'flex', flexFlow: 'column' }"
  >
    <div :style="{ marginBottom: '24px' }">
      <song-preview :song="selectedSong" />
    </div>

    <template v-if="loadedDetails">
      <div :style="{ marginBottom: '36px' }">
        <service-list :details="details" :song="selectedSong" />
      </div>

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <button
        @click="handleSubmit"
        class="cta-button submit-song"
        data-test="add-song-confirm"
        :style="{ marginTop: 'auto' }"
      >
        post it!!
      </button>
    </template>
    <template v-else>
      <div>loading...</div>
    </template>
  </div>
</template>

<script>
import _get from 'lodash/get';

import serializeSongLabel from '../../util/serializeSongLabel';
import ServiceList from './ServiceList.vue';
import SongPreview from './SongPreview.vue';

export default {
  components: { ServiceList, SongPreview },

  props: ['selectedSong', 'mixtapeId'],

  data() {
    return {
      loadedDetails: false,
      details: null,
      songLabel: serializeSongLabel(this.selectedSong),
      error: null,
    };
  },

  mounted() {
    this.loadSongDetails();
  },

  methods: {
    async loadSongDetails() {
      // TODO: dedupe this between here and <confirm-screen />
      let resp;

      try {
        resp = await this.$axios({
          url: `/spotify-details/${this.selectedSong.spotifyId}`,
          method: 'GET',
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
      }

      this.details = resp.data;

      this.loadedDetails = true;
    },

    async handleSubmit(evt) {
      evt.preventDefault();

      const params = {
        source: 'spotify',
        spotifyId: this.selectedSong.spotifyId,
      };

      let resp;
      try {
        resp = await this.$axios({
          url: `/mixtapes/${this.mixtapeId}/songs`,
          method: 'POST',
          data: params,
        });
      } catch (err) {
        const error = _get(err.response.data, 'error');
        if (error) {
          this.error = error;
        } else {
          this.error = 'An unexpected error occurred.';
        }
        return;
      }

      this.$store.dispatch('addSongToMixtape', {
        mixtapeId: this.mixtapeId,
        song: resp.data,
      });

      this.$emit('finished');
    },
  },
};
</script>

<style lang="scss" scoped>
.error {
  color: red;
  font-weight: bold;
}
</style>
