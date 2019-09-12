<template>
  <div class="audio-player--bar" v-if="currentSong">
    <audio-player-song-display
      :song="currentSong"
      :playback-source-path="playbackSourcePath"
      :playback-source-label="playbackSourceLabel"
    />

    <div class="audio-player--controls" v-if="currentSong">
      <loading-spinner v-if="isBuffering" />
      <template v-else>
        <div class="audio-player--control-container"></div>
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
      </template>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

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
      'isPlaying',
      'isBuffering',
      'playbackSourcePath',
      'playbackSourceLabel',
    ]),

    ...mapGetters('playback', ['currentSong']),

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

    handleNextClick() {
      this.$store.dispatch('playback/nextSong');
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

  button {
    margin: 0 auto;
    height: 40px;
    width: 40px;
    border-radius: 40px;

    &:hover,
    &:active {
      .icon {
        fill: #ccc;
      }
    }

    &.play-pause-button {
      border: 2px #aaa solid;

      &:hover,
      &:active {
        background: white;
        border-color: white;

        .icon {
          fill: black;
        }
      }
    }

    display: block;
    background: none;
  }

  .icon {
    width: 100%;
    height: 100%;
    fill: white;
  }

  button.play .icon {
    // idk why this makes it seem more centered but it does
    margin-left: 1px;
  }
}
</style>
