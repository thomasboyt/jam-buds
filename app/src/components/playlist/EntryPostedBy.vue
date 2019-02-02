<template>
  <div class="posted-by">
    <router-link :to="`/users/${entry.user.name}`">{{
      displayName
    }}</router-link>
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
        return `@${this.entry.user.name}`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.posted-by {
  border: 3px var(--theme-border-color) solid;
  display: inline-block;
  padding: 5px 15px;
  border-bottom: 0;

  a {
    color: var(--theme-link-color);
    font-weight: 500;
  }
}
</style>
