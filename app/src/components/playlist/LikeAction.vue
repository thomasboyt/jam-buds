<template>
  <div :class="['like-group', { mobile }]">
    <button
      class="action-button"
      @click="handleToggleLike"
      :disabled="requestInFlight || !authenticated"
      data-test="like-button"
    >
      <icon v-if="isLiked" :glyph="heartFilledIcon" />
      <icon v-else :glyph="heartOpenIcon" />
    </button>
    <span class="like-count" data-test="like-count">{{ likeCount || '' }}</span>
  </div>
</template>

<script>
import Icon from '../Icon.vue';

const heartOpenIcon = require('~/assets/heart_open.svg');
const heartFilledIcon = require('~/assets/heart_filled.svg');

export default {
  components: { Icon },

  props: [
    'itemType',
    'itemId',
    'isLiked',
    'likeCount',
    'likeSourceParams',
    'mobile',
  ],

  data() {
    return {
      heartOpenIcon,
      heartFilledIcon,
      requestInFlight: false,
    };
  },

  computed: {
    authenticated() {
      return this.$accessor.auth.authenticated;
    },
  },

  methods: {
    async handleToggleLike(e) {
      e.preventDefault();

      const action = this.isLiked ? 'unlikeItem' : 'likeItem';

      this.requestInFlight = true;

      try {
        await this.$store.dispatch(`playlistItems/${action}`, {
          itemId: this.itemId,
          itemType: this.itemType,
          ...this.likeSourceParams,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.requestInFlight = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.like-group {
  display: flex;
  align-items: center;

  display: none;
  &.mobile {
    display: flex;
  }

  @media (min-width: $breakpoint-small) {
    display: flex;
    &.mobile {
      display: none;
    }
  }

  &.mobile {
    height: 20px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.like-count {
  min-width: 40px;
  padding: 0 5px;
  text-align: left;
}
</style>
