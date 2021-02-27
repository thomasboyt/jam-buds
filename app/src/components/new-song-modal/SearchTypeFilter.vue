<template>
  <div class="filters-row">
    <button
      :class="buttonClass('song')"
      type="button"
      @click="setSearchType('song')"
    >
      songs
    </button>
    <button
      :class="buttonClass('album')"
      type="button"
      @click="setSearchType('album')"
    >
      albums
    </button>
  </div>
</template>

<script>
export default {
  props: ['searchType'],

  methods: {
    setSearchType(type) {
      this.$emit('changeSearchType', type);
    },

    buttonClass(type) {
      return {
        'filter-button': true,
        active: type === this.searchType,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.filters-row {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $text-base;
  border-bottom: 1px #777 solid;
  margin-bottom: $spacing-sm;
}

.filter-button {
  display: block;
  flex: 1 1 auto;
  padding: $spacing-2xs;
  text-align: center;
  border-bottom: 4px transparent solid;

  &.active {
    font-weight: 600;
    border-bottom-color: #777;
  }
}
</style>
