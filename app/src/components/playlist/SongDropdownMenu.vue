<template>
  <playlist-item-dropdown-menu>
    <playlist-item-dropdown-menu-item v-if="song.spotifyId">
      <a :href="spotifyUrl" target="_blank" rel="noopener noreferrer"
        >Open in Spotify</a
      >
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item v-if="song.appleMusicUrl">
      <a :href="song.appleMusicUrl" target="_blank" rel="noopener noreferrer"
        >Open in Apple Music</a
      >
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item v-if="song.bandcampUrl">
      <a :href="song.bandcampUrl" target="_blank" rel="noopener noreferrer"
        >Open on Bandcamp</a
      >
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item>
      <youtube-search-link :song="song" />
    </playlist-item-dropdown-menu-item>
    <playlist-item-dropdown-menu-item v-if="!!ownPostId">
      <button type="button" data-test="delete-song" @click="handleClickDelete">
        Delete
      </button>
    </playlist-item-dropdown-menu-item>
  </playlist-item-dropdown-menu>
</template>

<script>
import YoutubeSearchLink from './YoutubeSearchLink.vue';
import { getSpotifySongUrl } from '~/util/getSpotifyUrl';
import PlaylistItemDropdownMenu from './PlaylistItemDropdownMenu.vue';
import PlaylistItemDropdownMenuItem from './PlaylistItemDropdownMenuItem.vue';

export default {
  components: {
    YoutubeSearchLink,
    PlaylistItemDropdownMenu,
    PlaylistItemDropdownMenuItem,
  },

  props: ['song', 'ownPostId'],

  computed: {
    spotifyUrl() {
      return getSpotifySongUrl(this.song.spotifyId);
    },
  },

  methods: {
    async handleClickDelete() {
      const confirmedDelete = window.confirm(
        'Are you sure you want to remove your post?'
      );

      if (confirmedDelete) {
        try {
          await this.$store.dispatch('playlist/deletePost', {
            id: this.ownPostId,
          });
        } catch (err) {
          this.$store.commit('showErrorModal');
          throw err;
        }
      }
    },
  },
};
</script>
