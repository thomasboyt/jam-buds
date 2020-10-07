<template>
  <div class="confirm-screen">
    <div :style="{ marginBottom: '12px' }">
      <song-preview :song="selectedSong" />
    </div>

    <template v-if="loadedDetails">
      <service-list :details="details" :song="selectedSong" />

      <div :style="{ margin: '36px 0' }">
        <note-field v-model="noteText" />
      </div>

      <p>
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
        data-test="add-song-confirm"
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

import serializeSongLabel from '../../util/serializeSongLabel';
import NoteField, { MAX_POST_LENGTH } from './NoteField.vue';
import ServiceList from './ServiceList.vue';
import SongPreview from './SongPreview.vue';
import JbButton from '../lib/JbButton';

export default {
  components: { NoteField, ServiceList, SongPreview, JbButton },

  props: ['selectedSong'],

  data() {
    return {
      loadedDetails: false,
      details: null,
      noteText: '',
      twitterPostEnabled: false,
      songLabel: serializeSongLabel(this.selectedSong),
      error: null,
    };
  },

  computed: {
    ...mapState({
      hasTwitter: (state) => !!state.currentUser.twitterName,
    }),
  },

  mounted() {
    this.loadSongDetails();
  },

  methods: {
    async loadSongDetails() {
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

      if (this.noteText > MAX_POST_LENGTH) {
        this.$store.commit('showErrorModal', 'Yo your note is too long');
        return;
      }

      const params = {
        spotifyId: this.selectedSong.spotifyId,
        postTweet: this.twitterPostEnabled,
        noteText: this.noteText === '' ? null : this.noteText,
      };

      let resp;
      try {
        resp = await this.$axios({
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

      this.$store.dispatch('didSubmitSong', {
        song: resp.data,
        currentPath: this.$route.path,
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
