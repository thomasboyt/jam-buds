<template>
  <div class="filters-row">
    <button
      :class="buttonClass('song')"
      type="button"
      @click="setJamType('song')"
    >
      songs
    </button>
    <button
      :class="buttonClass('album')"
      type="button"
      @click="setJamType('album')"
    >
      albums
    </button>
    <button
      :class="buttonClass('mixtape')"
      type="button"
      @click="setJamType('mixtape')"
    >
      mixtapes
    </button>
  </div>
</template>

<script>
export default {
  props: ['jamType'],

  methods: {
    setJamType(type) {
      this.$emit('changeJamType', type);
    },

    buttonClass(type) {
      return {
        'filter-button': true,
        [type]: true,
        active: type === this.jamType,
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
  flex: 1 1 0px;
  padding: $spacing-2xs;
  text-align: center;
  border-bottom: 4px transparent solid;

  &.active {
    font-weight: 600;
    border-bottom-color: #777;
  }

  &.mixtape {
    @media (max-width: $breakpoint-small) {
      display: none;
    }
  }
}
</style>
