<template>
  <div>
    <nuxt-link :class="['settings-panel', 'mobile']" :to="path">
      <div class="panel-body">
        <h3>{{ title }}</h3>
        <slot />
      </div>
      <div class="panel-control">
        <icon :glyph="arrow" class="icon arrow right" />
      </div>
    </nuxt-link>
    <div :class="['settings-panel', 'desktop']">
      <button class="expand-row" @click="toggleExpanded">
        <div class="panel-body">
          <h3>{{ title }}</h3>
          <slot />
        </div>
        <div class="panel-control">
          <icon
            :glyph="arrow"
            :class="['icon', 'arrow', { right: !isExpanded }]"
          />
        </div>
      </button>
      <div v-if="isExpanded" class="panel-expanded">
        <slot name="expanded" />
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '../Icon';

import arrow from '~/assets/arrow.svg';

export default {
  components: { Icon },

  props: ['title', 'path'],

  data() {
    return { arrow, isExpanded: false };
  },

  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

@media (max-width: $breakpoint-small) {
  .settings-panel.mobile {
    display: flex;
  }
  .settings-panel.desktop {
    display: none;
  }
}
@media (min-width: $breakpoint-small) {
  .settings-panel.mobile {
    display: none;
  }
  .settings-panel.desktop {
    display: block;
  }
}

a.settings-panel {
  text-decoration: none;
}

.settings-panel {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
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

    .icon.arrow {
      display: block;
      width: 30px;
      height: 30px;
      margin-left: auto;

      &.right {
        transform: rotate(-90deg);
      }
    }
  }

  h3 {
    @include heading-sm();
    margin-bottom: 0.5rem;
  }

  button.expand-row {
    display: flex;
    text-align: left;
    width: 100%;
    padding: 0;
  }

  .panel-expanded {
    margin-top: 20px;
  }
}
</style>
