<template>
  <div
    class="confirm-screen"
    :style="{ minHeight: '100%', display: 'flex', flexFlow: 'column' }"
  >
    <p>
      you're posting <strong>{{ songLabel }}</strong>
    </p>

    <template v-if="loadedDetails">
      <div>
        <p>your pals will be able to stream this song on:</p>

        <ul class="service-list">
          <li>
            <span v-if="details.spotifyId">✅</span
            ><span v-else>❌</span> spotify
          </li>
          <li>
            <span v-if="details.appleMusicId">✅</span
            ><span v-else>❌</span> apple music
          </li>
          <li>
            ✅ youtube
            <a
              :href="youtubeSearchUrl"
              target="_blank"
              rel="noopener noreferrer"
              >(preview search)</a
            >
          </li>
        </ul>

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

      <button
        @click="handleSubmit"
        class="submit"
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
import { mapState } from 'vuex';

import serializeSongLabel from '../../util/serializeSongLabel';
import getYoutubeSearchUrl from '../../util/getYoutubeSearchUrl';
import TwitterShareField from './TwitterShareField.vue';
import {
  getDefaultTweet,
  getTweetLength,
  TWEET_LENGTH,
} from '../../util/songTweet';

export default {
  components: { TwitterShareField },

  props: ['selectedSong'],

  data() {
    return {
      loadedDetails: false,
      details: null,
      tweetText: '',
      twitterPostEnabled: false,
      songLabel: serializeSongLabel(this.selectedSong),
    };
  },

  computed: {
    ...mapState({
      hasTwitter: (state) => !!state.currentUser.twitterName,
    }),
    youtubeSearchUrl() {
      return getYoutubeSearchUrl(this.selectedSong);
    },
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
      const resp = await this.$axios({
        url: `/spotify-details/${this.selectedSong.spotifyId}`,
        method: 'GET',
      });

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
          alert('Yo your twitter message is too long');
          return;
        }

        params.tweet = this.tweetText === '' ? null : this.tweetText;
      }

      const resp = await this.$axios({
        url: '/posts',
        method: 'POST',
        data: params,
      });

      this.$store.dispatch('didSubmitSong', resp.data);
      this.$emit('finished');
    },
  },
};
</script>

<style lang="scss" scoped>
.service-list {
  text-align: left;
  li {
    line-height: 2em;
  }
}
</style>
