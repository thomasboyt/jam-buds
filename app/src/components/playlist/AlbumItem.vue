<template>
  <div>
    <!-- TODO: render a <a> tag here if a streaming service is set -->
    <playlist-item-row component="div" @click="handleClick" :is-link="true">
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
          <album-dropdown-menu :album="album" :own-post-id="ownPostId" />
        </slot>
      </playlist-item-actions>
    </playlist-item-row>
    <connect-streaming-banner
      :show="showConnectStreamingBanner"
      @close="handleCloseStreamingBanner"
      @connected="handleConnectedFromStreamingBanner"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import AlbumArt from './AlbumArt.vue';
import ConnectStreamingBanner from './ConnectStreamingBanner';
import LikeAction from './LikeAction.vue';
import PlaylistItemActions from './PlaylistItemActions';
import PlaylistItemLabel from './PlaylistItemLabel.vue';
import PlaylistItemRow from './PlaylistItemRow.vue';
import AlbumDropdownMenu from './AlbumDropdownMenu.vue';
import { getSpotifyAlbumUrl } from '~/util/getSpotifyUrl';
import getYoutubeSearchUrl from '~/util/getYoutubeSearchUrl';

export default {
  components: {
    AlbumArt,
    ConnectStreamingBanner,
    LikeAction,
    PlaylistItemActions,
    PlaylistItemLabel,
    PlaylistItemRow,
    AlbumDropdownMenu,
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

  data() {
    return {
      showConnectStreamingBanner: false,
    };
  },

  computed: {
    ...mapState({
      streamingService: (state) => state.streaming.service,

      album(state) {
        return state.playlistItems.albums[this.albumId];
      },
    }),

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
      // Don't trigger playback if user was clicking on one of the action
      // buttons
      if (e.target.closest('.action-button')) {
        return;
      }

      if (this.streamingService) {
        if (this.canOpen) {
          this.openInPreferredService();
        } else {
          // TODO: show error modal "cannot be played on spotify"
        }
      } else {
        this.showConnectStreamingBanner = true;
      }
    },
    openInPreferredService() {
      if (this.streamingService === 'spotify') {
        window.open(getSpotifyAlbumUrl(this.album.spotifyId));
      } else if (this.streamingService === 'appleMusic') {
        window.open(this.album.appleMusicUrl);
      } else if (this.streamingService === 'youtube') {
        window.open(getYoutubeSearchUrl(this.album));
      }
    },
    handleConnectedFromStreamingBanner() {
      this.showConnectStreamingBanner = false;
      this.openInPreferredService();
    },
    handleCloseStreamingBanner() {
      this.showConnectStreamingBanner = false;
    },
  },
};
</script>
