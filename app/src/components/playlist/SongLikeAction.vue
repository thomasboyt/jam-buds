<template>
  <song-action-button
    class="like-button"
    :icon="icon"
    @click="handleToggleLike"
    :disabled="requestInFlight || !authenticated"
  >
    {{ likeCount || 'Like' }}
  </song-action-button>

  <!-- <div :class="['like-group', { mobile }]">
    <button
      class="action-button"
      @click="handleToggleLike"
      :disabled="requestInFlight || !authenticated"
    >
      <icon v-if="song.isLiked" :glyph="heartFilledIcon" />
      <icon v-else :glyph="heartOpenIcon" />
    </button>
    <span class="like-count">{{ likeCount }}</span>
  </div> -->
</template>

<script>
import { mapState } from 'vuex';
import SongActionButton from './SongActionButton.vue';

const heartOpenIcon = require('../../../assets/heart_open.svg');
const heartFilledIcon = require('../../../assets/heart_filled.svg');

export default {
  components: { SongActionButton },

  props: ['song', 'mobile'],

  data() {
    return {
      heartOpenIcon,
      heartFilledIcon,
      requestInFlight: false,
    };
  },

  computed: {
    ...mapState({
      authenticated: (state) => state.auth.authenticated,
    }),

    likeCount() {
      return this.song.likeCount || '';
    },

    icon() {
      return this.song.isLiked ? heartFilledIcon : heartOpenIcon;
    },
  },

  methods: {
    async handleToggleLike(e) {
      e.preventDefault();

      const action = this.song.isLiked ? 'unlikeSong' : 'likeSong';

      this.requestInFlight = true;

      try {
        await this.$store.dispatch(`${action}`, { id: this.song.id });
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
@import '../../../styles/mixins.scss';

.like-button {
  min-width: 90px;
}

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

  @media (max-width: $breakpoint-small) {
    font-size: 14px;
    min-width: 35px;
    margin-right: -10px;
  }
}
</style>
