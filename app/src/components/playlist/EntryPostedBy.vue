<template>
  <div class="posted-by">
    <template v-if="entryType === 'feed-entry'">
      <names-list :names="entry.userNames" />
      posted ({{ timestamp }} ago)
    </template>
    <template v-if="entryType === 'like-entry'">
      Liked {{ timestamp }} ago
    </template>
    <template v-if="entryType === 'playlist-entry'">
      Posted {{ timestamp }} ago
    </template>
  </div>
</template>

<script>
import distanceInWords from 'date-fns/distance_in_words';
import NamesList from './NamesList.vue';

export default {
  components: { NamesList },

  props: ['entry', 'entryType'],

  computed: {
    timestamp() {
      const addedDate = new Date(this.entry.timestamp);
      return distanceInWords(new Date(), addedDate);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/mixins.scss';

.posted-by {
  display: inline-block;
  padding: 5px 0;

  a {
    color: var(--theme-text-color);
    font-weight: 500;
  }

  @media (max-width: $breakpoint-small) {
    padding: 0px;
    font-size: 15px;
    line-height: 22px;
  }
}
</style>
