<template>
  <div>
    <playlist-item-row component="div" @click="handleClick">
      <album-art :album-art="album.albumArt" />

      <playlist-item-label>
        <template #line-one>
          {{ artistsLabel }}
        </template>
        <template #line-two>
          <em>{{ album.title }}</em>
        </template>
        <like-action
          :mobile="true"
          item-type="album"
          :item-id="album.id"
          :is-liked="album.meta.isLiked"
          :like-count="album.meta.likeCount"
        />
      </playlist-item-label>

      <playlist-item-actions>
        <slot name="actions">
          <like-action
            item-type="album"
            :item-id="album.id"
            :is-liked="album.meta.isLiked"
            :like-count="album.meta.likeCount"
            :like-source-params="likeSourceParams"
          />
        </slot>
      </playlist-item-actions>
    </playlist-item-row>
  </div>
</template>

<script>
import AlbumArt from './AlbumArt.vue';
import LikeAction from './LikeAction.vue';
import PlaylistItemActions from './PlaylistItemActions';
import PlaylistItemLabel from './PlaylistItemLabel.vue';
import PlaylistItemRow from './PlaylistItemRow.vue';

export default {
  components: {
    AlbumArt,
    LikeAction,
    PlaylistItemActions,
    PlaylistItemLabel,
    PlaylistItemRow,
  },

  props: {
    albumId: {
      type: Number,
      required: true,
    },
    posts: {
      type: Array,
    },
    ownPostId: {
      type: Number,
    },
    likeSourceParams: {
      type: Object,
    },
  },

  computed: {
    streamingService() {
      return this.$accessor.streaming.service;
    },

    album() {
      return this.$accessor.playlistItems.albums[this.albumId];
    },

    canOpen() {
      if (this.streamingService === 'spotify') {
        return !!this.album.spotifyId;
      } else if (this.streamingService === 'appleMusic') {
        return !!this.album.appleMusicId;
      }

      // for all other users, the song is always clickable, so it can trigger
      // the connect-streaming banner
      return true;
    },

    artistsLabel() {
      return this.album.artists.join(', ');
    },
  },

  methods: {
    handleClick(e) {
      // Don't trigger modal if user was clicking on one of the action
      // buttons
      if (e.target.closest('.action-button')) {
        return;
      }

      this.$router.push({
        query: { modal: 'item-detail', albumId: this.albumId },
      });
    },
    // openInPreferredService() {
    //   if (this.streamingService === 'spotify') {
    //     window.open(getSpotifyAlbumUrl(this.album.spotifyId));
    //   } else if (this.streamingService === 'appleMusic') {
    //     window.open(this.album.appleMusicUrl);
    //   } else if (this.streamingService === 'youtube') {
    //     window.open(getYoutubeSearchUrl(this.album));
    //   }
    // },
  },
};
</script>
