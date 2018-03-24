<template>
  <div class="posted-by">
    <router-link :to="`/users/${entry.user.twitterName}`">
      {{ displayName }}
    </router-link>
    posted ({{ timestamp }} ago)
  </div>
</template>

<script>
import _get from 'lodash/get';
import distanceInWords from 'date-fns/distance_in_words';

export default {
  props: ['entry'],

  computed: {
    timestamp() {
      const addedDate = new Date(this.entry.added);
      return distanceInWords(new Date(), addedDate);
    },

    displayName() {
      const currentUserId = _get(this.$store.state.currentUser, 'id');

      if (currentUserId === this.entry.user.id) {
        return 'You';
      } else {
        return `@${this.entry.user.twitterName}`;
      }
    },
  },
};
</script>
