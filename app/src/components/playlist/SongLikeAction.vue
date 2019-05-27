<template>
  <button
    class="action-button"
    @click="handleToggleLike"
    :disabled="requestInFlight"
  >
    <icon v-if="song.isLiked" :glyph="heartFilledIcon" />
    <icon v-else :glyph="heartOpenIcon" />
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const heartOpenIcon = require('../../../assets/heart_open.svg');
const heartFilledIcon = require('../../../assets/heart_filled.svg');

export default {
  components: { Icon },

  props: ['song'],

  data() {
    return {
      heartOpenIcon,
      heartFilledIcon,
      requestInFlight: false,
    };
  },

  methods: {
    async handleToggleLike(e) {
      e.preventDefault();
      e.stopPropagation();

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
