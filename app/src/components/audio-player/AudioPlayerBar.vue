<template>
  <div class="audio-player--bar" v-if="nowPlaying">
    <audio-player-song-display
      :song="nowPlaying"
      :playback-source-path="playbackSourcePath"
      :playback-source-label="playbackSourceLabel"
    />

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
</template>

<script>
import { mapState } from 'vuex';

import Icon from '../Icon.vue';
import AudioPlayerSongDisplay from './AudioPlayerSongDisplay.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const playIcon = require('../../../assets/play.svg');
const pauseIcon = require('../../../assets/pause.svg');
const nextIcon = require('../../../assets/next.svg');

export default {
  components: {
    Icon,
    LoadingSpinner,
    AudioPlayerSongDisplay,
  },

  data() {
    return {
      playIcon,
      pauseIcon,
      nextIcon,
    };
  },

  computed: {
    ...mapState('playback', [
      'nowPlaying',
      'isPlaying',
      'isBuffering',
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
  },

  mounted() {
    document.body.classList.add('with-audio-player');
  },

  beforeDestroy() {
    document.body.classList.remove('with-audio-player');
  },

  methods: {
    handlePlayPauseClick() {
      this.$store.dispatch('playback/togglePlayback');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/mixins.scss';
@import '../../../styles/z-index.scss';

.audio-player--bar {
  background: $black;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 80px; // TODO: smaller on mobile
  align-items: center;
  z-index: $z-player-bar;

  &.audio-player-open-enter-active,
  &.audio-player-open-leave-active {
    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }

  &.audio-player-open-enter,
  &.audio-player-open-leave-to {
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
</style>