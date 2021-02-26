<template>
  <div>
    <div
      :class="[
        'playlist-song',
        { 'is-playing': isPlaying, 'can-play': canRequestPlay },
      ]"
      @mouseover="isHovering = true"
      @mouseleave="isHovering = false"
      @click="handleClick"
    >
      <album-art
        :album-art="song.albumArt"
        :can-play="canRequestPlay"
        :streaming-service="streamingService"
        :is-playing="isPlaying"
        :is-hovering="isHovering"
      />

      <div class="playlist-song--label">
        <div class="label-content">
          <div class="label-artist">{{ artistsLabel }}</div>
          <div class="label-title">{{ song.title }}</div>
        </div>
        <like-action
          :mobile="true"
          item-type="song"
          :item-id="song.id"
          :is-liked="song.meta.isLiked"
          :like-count="song.meta.likeCount"
        />
      </div>

      <playlist-item-actions>
        <slot name="actions">
          <like-action
            item-type="song"
            :item-id="song.id"
            :is-liked="song.meta.isLiked"
            :like-count="song.meta.likeCount"
          />
          <song-dropdown-menu :song="song" :own-post-id="ownPostId" />
        </slot>
      </playlist-item-actions>
    </div>
    <connect-streaming-banner
      :show="showConnectStreamingBanner"
      @close="handleCloseStreamingBanner"
      @connected="handleConnectedFromStreamingBanner"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import AlbumArt from './AlbumArt.vue';
import SongDropdownMenu from './SongDropdownMenu.vue';
import ConnectStreamingBanner from './ConnectStreamingBanner';
import LikeAction from './LikeAction.vue';
import PlaylistItemActions from './PlaylistItemActions';
import getSpotifyUrl from '~/util/getSpotifyUrl';
import getYoutubeSearchUrl from '~/util/getYoutubeSearchUrl';

export default {
  components: {
    AlbumArt,
    SongDropdownMenu,
    ConnectStreamingBanner,
    LikeAction,
    PlaylistItemActions,
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
  },

  data() {
    return {
      isHovering: false,
      showConnectStreamingBanner: false,
    };
  },

  computed: {
    ...mapState({
      canPlay(state) {
        return (
          (state.streaming.service === 'spotify' && this.song.spotifyId) ||
          (state.streaming.service === 'appleMusic' && this.song.appleMusicId)
        );
      },
      streamingService: (state) => state.streaming.service,

      song(state) {
        return state.songs[this.songId];
      },
    }),

    ...mapGetters('playback', ['currentSong']),
    ...mapGetters(['playerEnabled']),

    // TODO: once a modal is implemented for apple music song-missing state,
    // this will just always be true after loading
    canRequestPlay() {
      // for users with a connected streaming service, the song is clickable
      // if it can be played on that service
      if (this.streamingService === 'spotify') {
        return !!this.song.spotifyId;
      } else if (this.streamingService === 'appleMusic') {
        return !!this.song.appleMusicId;
      }

      // for all other users, the song is always clickable, so it can trigger
      // the connect-streaming banner
      return true;
    },

    isPlaying() {
      return this.currentSong && this.currentSong.id === this.song.id;
    },

    artistsLabel() {
      // filter out artists mentioned in the song title, except for the first artist
      // so "Disclosure, Kelis - Watch Your Step (Disclosure VIP Remix)" still shows "Disclosure, Kelis"
      // but "Disclosure, Kelis - Watch Your Step (ft. Kelis)" just says "Disclosure"
      const artistsToShow = this.song.artists.filter(
        (artist, idx) => idx === 0 || !this.song.title.includes(artist)
      );
      return artistsToShow.join(', ');
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
        if (this.playerEnabled) {
          if (this.canPlay) {
            this.$emit('requestPlay', this.songId);
          }
        } else {
          this.openInPreferredService();
        }
      } else {
        this.showConnectStreamingBanner = true;
      }
    },
    openInPreferredService() {
      if (this.streamingService === 'spotify') {
        window.open(getSpotifyUrl(this.song.spotifyId));
      } else if (this.streamingService === 'appleMusic') {
        window.open(this.song.appleMusicUrl);
      } else if (this.streamingService === 'youtube') {
        window.open(getYoutubeSearchUrl(this.song));
      }
      this.$store.dispatch('markSongPlayed', this.songId);
    },
    handleConnectedFromStreamingBanner() {
      this.showConnectStreamingBanner = false;
      if (this.playerEnabled) {
        if (this.canPlay) {
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

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.playlist-song {
  padding: 10px;
  margin: 0 -10px 10px -10px;

  display: flex;
  align-items: center;
  color: var(--theme-text-color);
  text-decoration: none;

  &:hover {
    &.can-play {
      cursor: pointer;
    }
  }
}

.playlist-song--label {
  line-height: 1.5em;
  flex: 1 1 auto;
  overflow-x: hidden;

  .label-artist,
  .label-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .label-artist {
    font-weight: 500;
  }
}

@media (max-width: $breakpoint-small) {
  .playlist-song {
    padding: 5px;
    margin: 0 -5px 15px -5px;
  }
}
</style>
