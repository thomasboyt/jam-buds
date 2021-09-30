<template>
  <modal :is-open="isOpen">
    <div v-if="isOpen">
      <div class="item-detail">
        <img v-if="item.albumArt" class="album-art" :src="item.albumArt" />
        <div :class="['title', { '-album': type === 'album' }]">
          {{ item.title }}
        </div>
        <div class="artist">{{ artists }}</div>
      </div>
      <open-in-service-list :item="item" :type="type" @opened="closeModal" />
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import getArtistsList from '~/util/getArtistsList';
import Modal from '../Modal.vue';
import OpenInServiceList from './OpenInServiceList.vue';
import { ApiSchema } from '~/api/_helpers';
import { closeModal } from '~/util/modal';

type Song = ApiSchema<'SongWithMeta'>;
type Album = ApiSchema<'Album'>;

export default Vue.extend({
  components: {
    Modal,
    OpenInServiceList,
  },

  computed: {
    isOpen(): boolean {
      return this.$route.query.modal === 'item-detail' && !!this.item;
    },

    item(): Song | Album | null {
      return this.song || this.album;
    },

    type(): 'song' | 'album' | null {
      if (this.song) {
        return 'song';
      } else if (this.album) {
        return 'album';
      }
      return null;
    },

    song(): Song | null {
      const songId =
        typeof this.$route.query.songId === 'string'
          ? parseInt(this.$route.query.songId)
          : null;
      if (!songId) {
        return null;
      }
      return this.$accessor.playlistItems.songs[songId];
    },

    album(): Album | null {
      const albumId =
        typeof this.$route.query.albumId === 'string'
          ? parseInt(this.$route.query.albumId)
          : null;
      if (!albumId) {
        return null;
      }
      return this.$accessor.playlistItems.albums[albumId];
    },

    artists(): string {
      return getArtistsList(this.item!.title, this.item!.artists);
    },
  },

  methods: {
    closeModal() {
      closeModal(this.$router, this.$route);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.item-detail {
  text-align: center;
  margin-bottom: $spacing-lg;
}

.album-art {
  margin: 0 auto;
  margin-bottom: $spacing-md;
  max-width: 200px;
}

.title {
  font-size: $text-lg;
  line-height: $leading-normal;
  font-weight: 600;
  color: white;
  margin-bottom: $spacing-xs;

  &.-album {
    font-style: italic;
  }
}

.artist {
  font-size: $text-md;
}
</style>
