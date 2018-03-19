<template>
  <div class="tweet-box">
    <textarea :value="value"
      @input="updateTweetText($event.target.value)">
    </textarea>
    ({{remainingChars}} characters left)
  </div>
</template>

<script>
import { getTweetLength } from '../../util/songTweet';

export default {
  props: ['value'],

  computed: {
    remainingChars() {
      return 240 - this.value.length;
    },
  },

  methods: {
    updateTweetText(value) {
      this.$emit('input', value);
    },
  },
};
</script>
