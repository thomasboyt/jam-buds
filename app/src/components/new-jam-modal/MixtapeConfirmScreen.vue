<template>
  <div class="confirm-screen">
    <div :style="{ marginBottom: '24px' }">
      <search-item-preview :item="selectedItem" />
    </div>

    <template v-if="loadedDetails">
      <div :style="{ marginBottom: '36px' }">
        <service-list :details="details" :song="selectedItem" />
      </div>

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <jb-button
        @click="handleSubmit"
        class="post-button"
        data-test="new-jam-confirm"
        button-style="solid"
      >
        post it!!
      </jb-button>
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
import SearchItemPreview from './SearchItemPreview.vue';
import JbButton from '../lib/JbButton';

export default {
  components: { ServiceList, SearchItemPreview, JbButton },

  props: ['selectedItem', 'mixtapeId'],

  data() {
    return {
      loadedDetails: false,
      details: null,
      songLabel: serializeSongLabel(this.selectedItem),
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
          url: `/search-details/songs`,
          method: 'GET',
          params: {
            source: this.selectedItem.source,
            key: this.selectedItem.key,
          },
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
        source: this.selectedItem.source,
        key: this.selectedItem.key,
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
@import '~/assets/styles/mixins.scss';

.confirm-screen {
  min-height: 100%;
  display: flex;
  flex-flow: column;
  text-align: center;
}

.error {
  color: red;
  font-weight: bold;
}

.post-button {
  margin-top: auto;
  color: $black;
  padding: 12px 0;
  background-color: hotpink;
  font-weight: bold;
  font-size: 1.5em;
}
</style>
