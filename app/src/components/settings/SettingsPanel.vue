<template>
  <div :class="['settings-panel', { 'is-link': isLink }]">
    <div class="panel-body">
      <h3>{{ title }}</h3>
      <slot />
    </div>
    <div class="panel-control">
      <icon v-if="isLink" :glyph="arrow" class="icon arrow-right" />
      <slot name="panel-control" v-else />
    </div>
  </div>
</template>

<script>
import Icon from '../Icon';

import arrow from '~/assets/arrow.svg?sprite';

export default {
  components: { Icon },

  props: ['title', 'isLink'],

  data() {
    return { arrow };
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.settings-panel {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  // TODO: massage these
  padding: 10px 10px;
  margin-bottom: 20px;

  display: flex;

  .panel-control {
    flex: 0 0 auto;
    align-self: center;
    margin-left: auto;
    line-height: 0;
    text-align: right;

    min-width: 50px;
    @media (min-width: $breakpoint-small) {
      min-width: 70px;
    }

    .icon {
      display: block;
      margin-left: auto;
      width: 30px;
      height: 30px;

      &.arrow-right {
        transform: rotate(-90deg);
      }
    }
  }

  h3 {
    @include heading-sm();
    margin-bottom: 0.5rem;
  }
}
</style>
