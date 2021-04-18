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
          <div class="audio-player--control-container">
            <audio-player-like-button class="like-toggle" :song="currentSong" />
          </div>
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

    <div class="volume-container">
      <audio-player-volume-bar />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '../Icon.vue';
import AudioPlayerSongDisplay from './AudioPlayerSongDisplay.vue';
import AudioPlayerProgress from './AudioPlayerProgress.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import AudioPlayerLikeButton from './AudioPlayerLikeButton.vue';
import AudioPlayerVolumeBar from './AudioPlayerVolumeBar.vue';
import { ApiSchema } from '~/api/_helpers';

const playIcon: string = require('~/assets/play-filled.svg');
const pauseIcon: string = require('~/assets/pause.svg');
const nextIcon: string = require('~/assets/next.svg');

export default Vue.extend({
  components: {
    Icon,
    LoadingSpinner,
    AudioPlayerSongDisplay,
    AudioPlayerProgress,
    AudioPlayerLikeButton,
    AudioPlayerVolumeBar,
  },

  data() {
    return {
      playIcon,
      pauseIcon,
      nextIcon,
    };
  },

  computed: {
    isPlaying(): boolean {
      return this.$accessor.playback.isPlaying;
    },
    isBuffering(): boolean {
      return this.$accessor.playback.isBuffering;
    },
    playbackSourcePath(): string | null {
      return this.$accessor.playback.playbackSourcePath;
    },
    playbackSourceLabel(): string | null {
      return this.$accessor.playback.playbackSourceLabel;
    },
    secondsElapsed(): number | null {
      return this.$accessor.playback.secondsElapsed;
    },
    secondsTotal(): number | null {
      return this.$accessor.playback.secondsTotal;
    },
    currentSong(): ApiSchema<'SongWithMeta'> | null {
      return this.$accessor.playback.currentSong;
    },

    authenticated(): boolean {
      return this.$accessor.auth.authenticated;
    },

    playPauseIcon(): string {
      return this.isPlaying ? pauseIcon : playIcon;
    },

    hasMobileTabBar(): boolean {
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
      this.$accessor.playback.togglePlayback();
    },

    handleNextClick() {
      this.$accessor.playback.nextSong();
    },
  },
});
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
    }

    .loading-spinner {
      font-size: 6px;
      margin-right: 26px;
    }

    .volume-container {
      display: none;
    }
  }

  @media (min-width: $breakpoint-small) {
    display: flex;
    justify-items: center;

    .audio-player--song-display {
      width: 30%;
    }

    .audio-player--controls-wrapper {
      width: 40%;
    }

    .volume-container {
      width: 30%;
    }

    .audio-player--controls {
      display: flex;
      width: 180px;

      .audio-player--control-container {
        flex: 1;
      }
    }

    .loading-spinner {
      font-size: 6px;
      margin: 16px auto;
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

  .like-toggle {
    @media (max-width: $breakpoint-small) {
      display: none;
    }
  }

  ::v-deep .icon {
    width: 20px;
    height: 20px;
    margin: 0 auto;
  }
}
</style>
