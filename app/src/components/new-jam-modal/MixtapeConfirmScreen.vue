<template>
  <div class="confirm-screen">
    <div :style="{ marginBottom: '24px' }">
      <search-item-preview :item="selectedItem" />
    </div>

    <template v-if="loadedDetails">
      <div :style="{ marginBottom: '36px' }">
        <service-list :details="details" :item="selectedItem" />
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

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ApiSchema } from '~/api/_helpers';

import serializeSongLabel from '../../util/serializeSongLabel';
import ServiceList from './ServiceList.vue';
import SearchItemPreview from './SearchItemPreview.vue';
import JbButton from '../lib/JbButton.vue';

export default Vue.extend({
  components: { ServiceList, SearchItemPreview, JbButton },

  props: {
    selectedItem: {
      type: Object as PropType<ApiSchema<'SongSearchResult'>>,
      required: true,
    },
    mixtapeId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      loadedDetails: false,
      details: null as ApiSchema<'SearchDetailsResponse'> | null,
      songLabel: serializeSongLabel(this.selectedItem),
      error: null as string | null,
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
        this.$accessor.showErrorModal();
        return;
      }

      this.details = resp.data as ApiSchema<'SearchDetailsResponse'>;

      this.loadedDetails = true;
    },

    async handleSubmit(evt: Event) {
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
        const error = err.response.data?.error;
        if (error) {
          this.error = error;
        } else {
          this.error = 'An unexpected error occurred.';
        }
        return;
      }

      this.$accessor.mixtapes.addSongToMixtape({
        mixtapeId: this.mixtapeId,
        song: resp.data,
      });

      this.$emit('finished');
    },
  },
});
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
