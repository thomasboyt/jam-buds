<template>
  <div class="tweet-box">
    <textarea :value="value" @input="updateTweetText($event.target.value)" />
    ({{ remainingChars }} characters left)
  </div>
</template>

<script>
import { getTweetLength, TWEET_LENGTH } from '../../util/songTweet';

export default {
  props: ['value'],

  computed: {
    remainingChars() {
      return TWEET_LENGTH - getTweetLength(this.value);
    },
  },

  methods: {
    updateTweetText(value) {
      this.$emit('input', value);
    },
  },
};
</script>
