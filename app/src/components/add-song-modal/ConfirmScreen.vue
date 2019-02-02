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

    <p>
      <label>
        <input type="checkbox" v-model="twitterPostEnabled" />
        cross-post to twitter
      </label>
    </p>

    <!-- XXX: Disabled until Twitter auth is reintroduced -->
    <!--
    <twitter-share-field v-if="twitterPostEnabled" v-model="tweetText"/>
    -->

    <button @click="handleSubmit" class="submit" data-test="add-song-confirm">
      post it!!
    </button>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import serializeSongLabel from '../../util/serializeSongLabel';
// import TwitterShareField from './TwitterShareField.vue';
import {
  getDefaultTweet,
  getTweetLength,
  TWEET_LENGTH,
} from '../../util/songTweet';

export default {
  // components: { TwitterShareField },

  data() {
    return {
      noteText: '',
      tweetText: '',
      twitterPostEnabled: false,
    };
  },

  computed: {
    ...mapGetters(['addSongArtist', 'addSongTitle']),

    ...mapState({
      songLabel: (state) => {
        const {
          manualArtist,
          manualTitle,
          manualEntry,
          selectedSong,
        } = state.addSong;

        if (manualEntry) {
          return `${manualArtist} - ${manualTitle}`;
        } else {
          return serializeSongLabel(selectedSong);
        }
      },
    }),
  },

  mounted() {
    this.tweetText = getDefaultTweet(this.addSongArtist, this.addSongTitle);
  },

  methods: {
    handleSubmit(evt) {
      evt.preventDefault();

      const opts = {
        note: this.noteText === '' ? null : this.noteText,
      };

      if (this.twitterPostEnabled) {
        if (getTweetLength(this.tweetText) > TWEET_LENGTH) {
          alert('Yo your twitter message is too long');
          return;
        }

        opts.tweet = this.tweetText === '' ? null : this.tweetText;
      }

      this.$store.dispatch('submitSong', opts);
    },
  },
};
</script>
