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

<script lang="ts">
import Vue, { PropType } from 'vue'; // eslint-disable-line import/named
import { ApiSchema } from '~/api/_helpers';
import Icon from '../Icon.vue';
type SongWithMeta = ApiSchema<'SongWithMeta'>;

const heartOpenIcon: string = require('~/assets/heart_open.svg');
const heartFilledIcon: string = require('~/assets/heart_filled.svg');

export default Vue.extend({
  components: { Icon },

  props: {
    song: {
      type: Object as PropType<SongWithMeta>,
      required: true,
    },
  },

  data() {
    return {
      heartOpenIcon,
      heartFilledIcon,
      requestInFlight: false,
    };
  },

  computed: {
    authenticated(): boolean {
      return this.$accessor.auth.authenticated;
    },
  },

  methods: {
    async handleToggleLike(e: Event) {
      e.preventDefault();

      const payload = {
        itemId: this.song.id,
        itemType: 'song' as const,
      };

      this.requestInFlight = true;

      try {
        if (this.song.meta.isLiked) {
          await this.$accessor.playlistItems.unlikeItem(payload);
        } else {
          await this.$accessor.playlistItems.likeItem({
            ...payload,
            // TODO: like source goes here
          } as any);
        }
      } catch (err) {
        this.$accessor.showErrorModal();
        throw err;
      } finally {
        this.requestInFlight = false;
      }
    },
  },
});
</script>
