<template>
  <div class="audio-player" v-if="hasStreamingService">
    <!-- TODO: There is an obvious edge case here of someone having both
    services. It'd be nice to support for rare cases of songs being on one but
    not the other, but, ehhhh -->
    <spotify-player
      v-if="hasSpotify && nowPlaying"
      :spotify-id="nowPlaying.spotifyId"
      :is-playing="isPlaying"
      @buffering="this.handleBufferingStart"
      @buffered="this.handleBufferingEnd"
      @ended="this.handlePlaybackEnded"
    />

    <apple-music-player
      v-if="hasAppleMusic && nowPlaying"
      :apple-music-id="nowPlaying.appleMusicId"
      :is-playing="isPlaying"
      @buffering="this.handleBufferingStart"
      @buffered="this.handleBufferingEnd"
      @ended="this.handlePlaybackEnded"
    />

    <transition name="audio-player-open">
      <div class="audio-player--bar" v-if="nowPlaying">
        <div class="audio-player--song-display">
          <div class="audio-player--art-container">
            <img v-if="albumArt" :src="albumArt" class="audio-player--art" />
            <icon
              v-else
              :glyph="placeholderIcon"
              class="audio-player--art-placeholder"
            />
          </div>
          <div class="audio-player--label-container">
            <div :style="{ fontWeight: '600' }">
              {{ artist }}
            </div>
            <div>{{ title }}</div>

            <div>
              playing from
              <router-link :to="playbackSourcePath">{{
                playbackSourceLabel
              }}</router-link>
            </div>
          </div>
        </div>

        <div class="audio-player--controls" v-if="nowPlaying">
          <loading-spinner v-if="isBuffering" />
          <button
            v-else
            class="play-pause-button"
            @click="handlePlayPauseClick"
            :disabled="!nowPlaying"
          >
            <icon :glyph="playPauseIcon" />
          </button>

          <!-- <button
          class="next-button"
          @click="handleNextClick"
          :disabled="!nowPlaying"
        >
          <icon :glyph="nextIcon" />
        </button> -->
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Icon from '../Icon.vue';

import SpotifyPlayer from './SpotifyPlayer.vue';
import AppleMusicPlayer from './AppleMusicPlayer.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const playIcon = require('../../../assets/play.svg');
const pauseIcon = require('../../../assets/pause.svg');
const nextIcon = require('../../../assets/next.svg');
const placeholderIcon = require('../../../assets/record.svg');

export default {
  components: {
    Icon,
    LoadingSpinner,
    SpotifyPlayer,
    AppleMusicPlayer,
  },

  data() {
    return {
      playIcon,
      pauseIcon,
      nextIcon,
      placeholderIcon,
      isBuffering: false,
    };
  },

  computed: {
    ...mapState('playback', [
      'nowPlaying',
      'isPlaying',
      'playbackSourcePath',
      'playbackSourceLabel',
    ]),

    ...mapState({
      hasStreamingService: (state) =>
        state.currentUser.hasSpotify || state.currentUser.hasAppleMusic,
      hasSpotify: (state) => state.currentUser.hasSpotify,
      hasAppleMusic: (state) => state.currentUser.hasAppleMusic,
      authenticated: (state) => state.auth.authenticated,
    }),

    playPauseIcon() {
      return this.isPlaying ? pauseIcon : playIcon;
    },

    artist() {
      return this.nowPlaying.artists[0];
    },

    title() {
      return this.nowPlaying.title;
    },

    albumArt() {
      return this.nowPlaying.albumArt;
    },

    embedProps() {
      return {
        isPlaying: this.isPlaying,
        'v-on:ended': this.handlePlaybackEnded,
      };
    },
  },

  methods: {
    handlePlayPauseClick() {
      this.$store.dispatch('playback/togglePlayback');
    },
    handleNextClick() {},
    handlePlaybackEnded() {
      this.$store.dispatch('playback/clearPlayback');
      this.isBuffering = false;
    },
    handleBufferingStart() {
      this.isBuffering = true;
    },
    handleBufferingEnd() {
      this.isBuffering = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/mixins.scss';

.audio-player--bar {
  background: $black;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 80px; // TODO: smaller on mobile
  align-items: center;

  &.audio-player-open-enter-active,
  .audio-player-open-leave-active {
    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }

  &.audio-player-open-enter,
  .audio-player-open-leave-to {
    bottom: -80px;
  }

  @media (max-width: $breakpoint-small) {
    display: flex;

    .audio-player--controls {
      margin-left: auto;
      .loading-spinner {
        // XXX: not sure why this is needed :\
        margin-right: 36px;
      }
    }
  }

  @media (min-width: $breakpoint-small) {
    display: grid;
    justify-items: center;
    grid-column-gap: 5px;
    grid-template-columns: 1fr 1fr 1fr;

    .audio-player--song-display {
      margin-right: auto; // right align this guy
    }
  }
}

.audio-player--controls {
  display: flex;

  button {
    flex: 0 0 auto;

    height: 60px;
    width: 60px;
    border-radius: 60px;

    display: block;
    background: none;

    &:hover,
    &:active {
      background: white;

      .icon {
        fill: black;
      }
    }
  }

  .icon {
    width: 40px;
    height: 40px;
    fill: white;
  }
}

.audio-player--song-display {
  display: flex;
  min-width: 0;
  max-width: 100%;
}

.audio-player--label-container {
  // needed for proper wrapping
  max-width: 100%;

  color: white;
  padding: 10px 15px;
  font-size: 14px;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a {
    color: $yellow;
  }
}

.audio-player--art-container {
  flex: 0 0 80px;
  height: 100%;
  width: 80px;
  padding: 10px;

  .audio-player--art {
    width: 100%;
  }

  img.audio-player--art-placeholder {
    padding: 10px;
    width: 100%;
  }

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
