<template>
  <div
    class="confirm-screen"
    :style="{ minHeight: '100%', display: 'flex', flexFlow: 'column' }"
  >
    <div :style="{ marginBottom: '24px' }">
      <song-preview :song="selectedSong" />
    </div>

    <template v-if="loadedDetails">
      <div>
        <service-list :details="details" :song="selectedSong" />

        <div v-if="hasTwitter">
          <p>
            <label>
              <input type="checkbox" v-model="twitterPostEnabled" />
              cross-post to twitter
            </label>
          </p>

          <twitter-share-field v-if="twitterPostEnabled" v-model="tweetText" />
        </div>
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
import { mapState } from 'vuex';

import serializeSongLabel from '../../util/serializeSongLabel';
import TwitterShareField from './TwitterShareField.vue';
import ServiceList from './ServiceList.vue';
import SongPreview from './SongPreview.vue';
import {
  getDefaultTweet,
  getTweetLength,
  TWEET_LENGTH,
} from '../../util/songTweet';

export default {
  components: { TwitterShareField, ServiceList, SongPreview },

  props: ['selectedSong'],

  data() {
    return {
      loadedDetails: false,
      details: null,
      tweetText: '',
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

    this.tweetText = getDefaultTweet(
      this.selectedSong.artists[0],
      this.selectedSong.title
    );
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

      const params = {
        source: 'spotify',
        spotifyId: this.selectedSong.spotifyId,
      };

      if (this.twitterPostEnabled) {
        if (getTweetLength(this.tweetText) > TWEET_LENGTH) {
          this.$store.commit(
            'showErrorModal',
            'Yo your twitter message is too long'
          );
          return;
        }

        params.tweet = this.tweetText === '' ? null : this.tweetText;
      }

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
.error {
  color: red;
  font-weight: bold;
}
</style>
