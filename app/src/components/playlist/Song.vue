<template>
  <div>
    <playlist-item-row component="div" @click="handleClick">
      <album-art :album-art="song.albumArt" :is-playing="isPlaying" />

      <playlist-item-label>
        <template #line-one>
          {{ artistsLabel }}
        </template>
        <template #line-two>
          {{ song.title }}
        </template>
        <like-action
          :mobile="true"
          item-type="song"
          :item-id="song.id"
          :is-liked="song.meta.isLiked"
          :like-count="song.meta.likeCount"
        />
      </playlist-item-label>

      <playlist-item-actions>
        <slot name="actions">
          <like-action
            item-type="song"
            :item-id="song.id"
            :is-liked="song.meta.isLiked"
            :like-count="song.meta.likeCount"
            :like-source-params="likeSourceParams"
          />
        </slot>
        <play-action
          @click.native="handlePlay"
          :can-play="!streamingService || canPlayOnCurrentService"
        />
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
import AlbumArt from './AlbumArt.vue';
import ConnectStreamingBanner from './ConnectStreamingBanner';
import LikeAction from './LikeAction.vue';
import PlayAction from './PlayAction.vue';
import PlaylistItemActions from './PlaylistItemActions';
import PlaylistItemLabel from './PlaylistItemLabel.vue';
import PlaylistItemRow from './PlaylistItemRow.vue';
import { getSpotifySongUrl } from '~/util/getSpotifyUrl';
import getYoutubeSearchUrl from '~/util/getYoutubeSearchUrl';
import getArtistsList from '~/util/getArtistsList';

export default {
  components: {
    AlbumArt,
    ConnectStreamingBanner,
    LikeAction,
    PlayAction,
    PlaylistItemActions,
    PlaylistItemLabel,
    PlaylistItemRow,
  },

  props: {
    songId: {
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
    song() {
      return this.$accessor.playlistItems.songs[this.songId];
    },

    streamingService() {
      return this.$accessor.streaming.service;
    },

    canPlayOnCurrentService() {
      return (
        (this.streamingService === 'spotify' && this.song.spotifyId) ||
        (this.streamingService === 'appleMusic' && this.song.appleMusicId)
      );
    },

    playerEnabled() {
      return this.$accessor.streaming.playerEnabled;
    },

    canRequestPlay() {
      return (
        this.streamingService &&
        this.playerEnabled &&
        this.canPlayOnCurrentService
      );
    },

    isPlaying() {
      const currentSong = this.$accessor.playback.currentSong;
      return currentSong && currentSong.id === this.song.id;
    },

    artistsLabel() {
      return getArtistsList(this.song.title, this.song.artists);
    },

    bestOpenableService() {
      if (this.streamingService === 'spotify' && this.song.spotifyId) {
        return 'spotify';
      } else if (
        this.streamingService === 'appleMusic' &&
        this.song.appleMusicId
      ) {
        return 'appleMusic';
      } else if (this.song.bandcampUrl) {
        return 'bandcamp';
      } else {
        return 'youtube';
      }
    },
  },

  methods: {
    handlePlay() {
      if (this.canRequestPlay) {
        this.$emit('requestPlay', this.songId);
      } else if (this.streamingService) {
        this.openInPreferredService();
      } else {
        this.showConnectStreamingBanner = true;
      }
    },
    handleClick(e) {
      // Don't trigger modal if user was clicking on one of the action
      // buttons
      if (e.target.closest('.action-button')) {
        return;
      }

      this.$accessor.playlistItems.markSongPlayed(this.songId);

      this.$router.push({
        query: { modal: 'item-detail', songId: this.songId },
      });
    },
    openInPreferredService() {
      const service = this.bestOpenableService;
      if (service === 'spotify') {
        window.open(getSpotifySongUrl(this.song.spotifyId));
      } else if (service === 'appleMusic') {
        window.open(this.song.appleMusicUrl);
      } else if (service === 'bandcamp') {
        window.open(this.song.bandcampUrl);
      } else {
        window.open(getYoutubeSearchUrl(this.song));
      }
    },
    handleConnectedFromStreamingBanner() {
      this.showConnectStreamingBanner = false;
      if (this.playerEnabled) {
        if (this.canPlayOnCurrentService) {
          this.$emit('requestPlay', this.songId);
        }
      } else {
        this.openInPreferredService();
      }
    },
    handleCloseStreamingBanner() {
      this.showConnectStreamingBanner = false;
    },
  },
};
</script>
