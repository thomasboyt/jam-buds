<template>
  <div class="confirm-screen">
    <div :style="{ marginBottom: '12px' }">
      <search-item-preview :item="selectedItem" />
    </div>

    <template v-if="loadedDetails">
      <service-list
        :details="details"
        :item="selectedItem"
        :type="selectedType"
      />

      <div :style="{ margin: '36px 0' }">
        <note-field v-model="noteText" />
      </div>

      <p v-if="hasTwitter">
        <label>
          <input type="checkbox" v-model="twitterPostEnabled" />
          cross-post to twitter
        </label>
      </p>

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

import NoteField, { MAX_POST_LENGTH } from './NoteField.vue';
import ServiceList from './ServiceList.vue';
import SearchItemPreview from './SearchItemPreview.vue';
import JbButton from '../lib/JbButton.vue';
import { SelectedItem } from './common';

export default Vue.extend({
  components: { NoteField, ServiceList, SearchItemPreview, JbButton },

  props: {
    selectedItem: {
      type: Object as PropType<SelectedItem>,
      required: true,
    },
    selectedType: {
      type: String as PropType<'song' | 'album'>,
      required: true,
    },
  },

  data() {
    return {
      loadedDetails: false,
      details: null as ApiSchema<'SearchDetailsResponse'> | null,
      noteText: '',
      twitterPostEnabled: false,
      error: null as string | null,
    };
  },

  computed: {
    hasTwitter(): boolean {
      return !!this.$accessor.currentUser.user!.twitterName;
    },
  },

  mounted() {
    this.loadItemDetails();
  },

  methods: {
    async loadItemDetails() {
      let resp;

      const urlPrefix = this.selectedType === 'album' ? 'albums' : 'songs';

      try {
        resp = await this.$axios({
          url: `/search-details/${urlPrefix}`,
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

      if (this.noteText.length > MAX_POST_LENGTH) {
        this.$accessor.showErrorModal('Yo your note is too long');
        return;
      }

      const params = {
        type: this.selectedType,
        postTweet: this.twitterPostEnabled,
        noteText: this.noteText === '' ? null : this.noteText,
        source: this.selectedItem.source,
        key: this.selectedItem.key,
      };

      try {
        await this.$axios({
          url: '/posts',
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

      const userName = this.$accessor.currentUser.user!.name;
      const currentPath = this.$route.path;
      const profilePath = `/users/${userName}`;
      if (currentPath === '/') {
        this.$accessor.playlist.loadNewPlaylistEntries({
          key: 'feed',
        });
      } else if (currentPath === profilePath) {
        this.$accessor.playlist.loadNewPlaylistEntries({
          key: `${userName}/posts`,
        });
      }

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
