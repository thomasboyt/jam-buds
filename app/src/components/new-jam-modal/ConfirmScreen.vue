<template>
  <div class="confirm-screen">
    <div :style="{ marginBottom: '12px' }">
      <search-item-preview :item="selectedItem" />
    </div>

    <template v-if="loadedDetails">
      <service-list :details="details" :song="selectedItem" />

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

<script>
import _get from 'lodash/get';
import { mapState } from 'vuex';

import NoteField, { MAX_POST_LENGTH } from './NoteField.vue';
import ServiceList from './ServiceList.vue';
import SearchItemPreview from './SearchItemPreview.vue';
import JbButton from '../lib/JbButton';

export default {
  components: { NoteField, ServiceList, SearchItemPreview, JbButton },

  props: ['selectedItem', 'selectedType'],

  data() {
    return {
      loadedDetails: false,
      details: null,
      noteText: '',
      twitterPostEnabled: false,
      error: null,
    };
  },

  computed: {
    ...mapState({
      hasTwitter: (state) => !!state.currentUser.twitterName,
    }),
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
        this.$store.commit('showErrorModal');
        return;
      }

      this.details = resp.data;

      this.loadedDetails = true;
    },

    async handleSubmit(evt) {
      evt.preventDefault();

      if (this.noteText > MAX_POST_LENGTH) {
        this.$store.commit('showErrorModal', 'Yo your note is too long');
        return;
      }

      const params = {
        spotifyId: this.selectedItem.spotifyId,
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
        const error = _get(err.response.data, 'error');
        if (error) {
          this.error = error;
        } else {
          this.error = 'An unexpected error occurred.';
        }
        return;
      }

      const userName = this.$store.state.currentUser.name;
      const currentPath = this.$route.path;
      const profilePath = `/users/${userName}`;
      if (currentPath === '/') {
        this.$store.dispatch('loadNewPlaylistEntries', {
          key: 'feed',
        });
      } else if (currentPath === profilePath) {
        this.$store.dispatch('loadNewPlaylistEntries', {
          key: `${userName}/posts`,
        });
      }

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
