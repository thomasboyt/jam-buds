<template>
  <div
    :class="['audio-player--bar', { 'has-mobile-tab-bar': hasMobileTabBar }]"
    v-if="currentSong"
  >
    <audio-player-song-display
      :song="currentSong"
      :playback-source-path="playbackSourcePath"
      :playback-source-label="playbackSourceLabel"
    />

    <div class="audio-player--controls-wrapper" v-if="currentSong">
      <loading-spinner v-if="isBuffering" />
      <template v-else>
        <div class="audio-player--controls">
          <div class="audio-player--control-container" />
          <div class="audio-player--control-container">
            <button
              :class="{ 'play-pause-button': true, play: !isPlaying }"
              @click="handlePlayPauseClick"
              :disabled="!currentSong"
            >
              <icon :glyph="playPauseIcon" />
            </button>
          </div>

          <div class="audio-player--control-container">
            <button
              class="next-button"
              @click="handleNextClick"
              :disabled="!currentSong"
            >
              <icon :glyph="nextIcon" />
            </button>
          </div>
        </div>
      </template>
      <audio-player-progress />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import Icon from '../Icon.vue';
import AudioPlayerSongDisplay from './AudioPlayerSongDisplay.vue';
import AudioPlayerProgress from './AudioPlayerProgress.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const playIcon = require('~/assets/play-filled.svg');
const pauseIcon = require('~/assets/pause.svg');
const nextIcon = require('~/assets/next.svg');

export default {
  components: {
    Icon,
    LoadingSpinner,
    AudioPlayerSongDisplay,
    AudioPlayerProgress,
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
      'isPlaying',
      'isBuffering',
      'playbackSourcePath',
      'playbackSourceLabel',
      'secondsElapsed',
      'secondsTotal',
    ]),

    ...mapGetters('playback', ['currentSong']),

    ...mapState({
      authenticated: (state) => state.auth.authenticated,
    }),

    playPauseIcon() {
      return this.isPlaying ? pauseIcon : playIcon;
    },

    hasMobileTabBar() {
      return this.authenticated;
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

    handleNextClick() {
      this.$store.dispatch('playback/nextSong');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

.audio-player--bar {
  background: $black;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: $player-bar-height;
  align-items: center;
  z-index: $z-player-bar;

  &.audio-player-open-enter-active,
  &.audio-player-open-leave-active {
    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }

  &.audio-player-open-enter,
  &.audio-player-open-leave-to {
    bottom: -$player-bar-height;
  }

  @media (max-width: $breakpoint-small) {
    display: flex;

    &.has-mobile-tab-bar {
      bottom: var(--mobile-bottom-bar-height);
      border-bottom: 2px #000 solid;

      &.audio-player-open-enter,
      &.audio-player-open-leave-to {
        bottom: calc(var(--mobile-bottom-bar-height) - #{$player-bar-height});
      }
    }

    .audio-player--controls {
      margin-left: auto;
      margin-right: 10px;
      flex-flow: row-reverse; // reverse play and next buttons

      .loading-spinner {
        // XXX: not sure why this is needed :\
        margin-right: 26px;
      }
    }
  }

  @media (min-width: $breakpoint-small) {
    .audio-player--controls {
      display: flex;
      width: 180px;

      .audio-player--control-container {
        flex: 1;
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
  margin: 0 auto;

  button {
    margin: 0 auto;
    height: 36px;
    width: 36px;
    border-radius: 36px;
    display: block;

    background: none;
    color: white;

    &:hover,
    &:active {
      color: #ccc;
    }

    &.play-pause-button {
      border: 2px #aaa solid;

      &:hover,
      &:active {
        background: white;
        border-color: white;
        color: black;
      }
    }
  }

  .icon {
    width: 100%;
    height: 100%;
  }

  button.play .icon {
    // idk why this makes it seem more centered but it does
    margin-left: 1px;
  }
}
</style>
