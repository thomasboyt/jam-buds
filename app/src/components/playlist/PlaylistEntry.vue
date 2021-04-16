<template>
  <div data-test="playlist-entry">
    <song
      v-if="item.type === 'song'"
      :song-id="item.songId"
      :own-post-id="ownPostId"
      :like-source-params="likeSourceParams"
      @requestPlay="handleRequestPlay"
    />
    <mixtape-item
      v-else-if="item.type === 'mixtape'"
      :mixtape-id="item.mixtapeId"
      :like-source-params="likeSourceParams"
    />
    <album-item
      v-else-if="item.type === 'album'"
      :album-id="item.albumId"
      :own-post-id="ownPostId"
      :like-source-params="likeSourceParams"
    />
  </div>
</template>

<script>
import Song from './Song.vue';
import MixtapeItem from './MixtapeItem.vue';
import AlbumItem from './AlbumItem.vue';

export default {
  components: { Song, MixtapeItem, AlbumItem },

  props: ['item', 'likeSourceParams'],

  computed: {
    ownPostId() {
      if (!this.$accessor.auth.authenticated) {
        return null;
      }

      if (this.item.posts) {
        return this.item.posts.find(
          (post) => post.userName === this.$accessor.currentUser.user.name
        )?.postId;
      }

      // HACK: This should probably use props passed down instead of going off
      // of route
      if (
        this.$route.path === `/users/${this.$accessor.currentUser.user.name}`
      ) {
        return this.item.postId;
      }

      return null;
    },
  },

  methods: {
    handleRequestPlay() {
      this.$emit('requestPlay', this.item.songId);
      this.$store.dispatch('playlistItems/markSongPlayed', this.item.songId);
    },
  },
};
</script>
