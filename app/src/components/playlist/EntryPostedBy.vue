<template>
  <div class="posted-by">
    <template v-if="verb === 'posted' && names">
      <names-list :names="names" />
      posted ({{ formattedTimestamp }} ago)
    </template>
    <template v-else-if="verb === 'posted'">
      Posted {{ formattedTimestamp }} ago
    </template>
    <template v-else-if="verb === 'liked'">
      Liked {{ formattedTimestamp }} ago
    </template>
  </div>
</template>

<script>
import formatDistance from 'date-fns/formatDistance';
import NamesList from './NamesList.vue';

export default {
  components: { NamesList },

  props: ['names', 'verb', 'timestamp'],

  computed: {
    formattedTimestamp() {
      const addedDate = new Date(this.timestamp);
      return formatDistance(addedDate, new Date());
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.posted-by {
  padding: 5px 0px;
  border-bottom: 1px var(--theme-text-color) solid;

  a {
    color: var(--theme-text-color);
    font-weight: 500;
  }

  @media (max-width: $breakpoint-small) {
    padding: 0px;
    font-size: 15px;
    line-height: 22px;
    border-bottom: none;
  }
}
</style>
