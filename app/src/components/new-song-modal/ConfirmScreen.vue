<template>
  <div class="confirm-screen">
    <p>
      you're posting <strong>{{ songLabel }}</strong>
    </p>

    <div class="note-box">
      <textarea
        v-model="noteText"
        placeholder="(optional) Write a note about this song!"
      />
    </div>

    <div v-if="hasTwitter">
      <p>
        <label>
          <input type="checkbox" v-model="twitterPostEnabled" />
          cross-post to twitter
        </label>
      </p>

      <twitter-share-field v-if="twitterPostEnabled" v-model="tweetText" />
    </div>

    <button @click="handleSubmit" class="submit" data-test="add-song-confirm">
      post it!!
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import serializeSongLabel from '../../util/serializeSongLabel';
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
      noteText: '',
      tweetText: '',
      twitterPostEnabled: false,
      songLabel: serializeSongLabel(this.selectedSong),
    };
  },

  computed: mapState({
    hasTwitter: (state) => !!state.currentUser.twitterName,
  }),

  mounted() {
    this.tweetText = getDefaultTweet(
      this.selectedSong.artists[0],
      this.selectedSong.name
    );
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const params = {
        source: 'spotify',
        spotifyId: this.selectedSong.spotifyId,
        note: this.noteText === '' ? null : this.noteText,
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
    },
  },
};
</script>
