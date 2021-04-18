<template>
  <playlist-item-dropdown-menu>
    <playlist-item-dropdown-menu-item>
      <a :href="spotifyUrl" target="_blank" rel="noopener noreferrer"
        >Open in Spotify</a
      >
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item v-if="album.appleMusicUrl">
      <a :href="album.appleMusicUrl" target="_blank" rel="noopener noreferrer"
        >Open in Apple Music</a
      >
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item v-if="album.bandcampUrl">
      <a :href="album.bandcampUrl" target="_blank" rel="noopener noreferrer"
        >Open on Bandcamp</a
      >
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item v-if="!!ownPostId">
      <button type="button" data-test="delete-post" @click="handleClickDelete">
        Delete
      </button>
    </playlist-item-dropdown-menu-item>
  </playlist-item-dropdown-menu>
</template>

<script>
import { getSpotifyAlbumUrl } from '~/util/getSpotifyUrl';
import PlaylistItemDropdownMenu from './PlaylistItemDropdownMenu.vue';
import PlaylistItemDropdownMenuItem from './PlaylistItemDropdownMenuItem.vue';

export default {
  components: {
    PlaylistItemDropdownMenu,
    PlaylistItemDropdownMenuItem,
  },

  props: ['album', 'ownPostId'],

  computed: {
    spotifyUrl() {
      return getSpotifyAlbumUrl(this.album.spotifyId);
    },
  },

  methods: {
    async handleClickDelete() {
      const confirmedDelete = window.confirm(
        'Are you sure you want to remove your post?'
      );

      if (confirmedDelete) {
        try {
          await this.$accessor.playlist.deletePost({
            id: this.ownPostId,
          });
        } catch (err) {
          this.$accessor.showErrorModal();
          throw err;
        }
      }
    },
  },
};
</script>
