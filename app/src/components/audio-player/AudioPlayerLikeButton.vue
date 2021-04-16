<!-- 
this is copied in large part from SongLikeAction.vue and maybe should be shared?
-->
<template>
  <button
    v-if="authenticated"
    @click="handleToggleLike"
    :disabled="requestInFlight"
  >
    <icon v-if="song.meta.isLiked" :glyph="heartFilledIcon" />
    <icon v-else :glyph="heartOpenIcon" />
  </button>
</template>

<script>
import Icon from '../Icon.vue';

const heartOpenIcon = require('~/assets/heart_open.svg');
const heartFilledIcon = require('~/assets/heart_filled.svg');

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

  computed: {
    authenticated() {
      return this.$accessor.auth.authenticated;
    },
  },

  methods: {
    async handleToggleLike(e) {
      e.preventDefault();

      const action = this.song.meta.isLiked ? 'unlikeItem' : 'likeItem';

      this.requestInFlight = true;

      try {
        await this.$store.dispatch(`playlistItems/${action}`, {
          itemId: this.song.id,
          itemType: 'song',
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
