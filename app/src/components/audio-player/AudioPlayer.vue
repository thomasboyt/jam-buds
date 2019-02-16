<template>
  <div class="audio-player" v-if="spotifyEnabled">
    <spotify-player
      v-if="nowPlaying"
      :spotify-id="nowPlaying.spotifyId"
      :is-playing="isPlaying"
      @buffering="this.handleBufferingStart"
      @buffered="this.handleBufferingEnd"
      @ended="this.handlePlaybackEnded"
    />

    <div class="audio-player--controls" v-if="nowPlaying">
      <button
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

    <div class="audio-player--main" v-if="nowPlaying">
      <div>{{ title }}</div>
      <div>{{ artist }}</div>

      <div>
        playing from
        <router-link :to="playbackSourcePath">{{
          playbackSourceLabel
        }}</router-link>
      </div>
    </div>

    <div class="audio-player--art-container">
      <loading-spinner v-if="isBuffering" />
      <img
        v-else-if="nowPlaying && albumArt"
        :src="albumArt"
        class="audio-player--art"
      />
      <img v-else :src="spotifyIcon" class="audio-player--art-placeholder" />
    </div>
  </div>
  <div class="audio-player" v-else-if="authenticated">
    <connect-button />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Icon from '../Icon.vue';

import SpotifyPlayer from './SpotifyPlayer.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import ConnectButton from './ConnectButton.vue';

const playIcon = require('../../../assets/play.svg');
const pauseIcon = require('../../../assets/pause.svg');
const nextIcon = require('../../../assets/next.svg');
const spotifyIcon = require('../../../assets/Spotify_Icon_RGB_White.png');

export default {
  components: { Icon, LoadingSpinner, SpotifyPlayer, ConnectButton },

  data() {
    return {
      playIcon,
      pauseIcon,
      nextIcon,
      spotifyIcon,
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
      spotifyEnabled: (state) => state.currentUser.hasSpotify,
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
