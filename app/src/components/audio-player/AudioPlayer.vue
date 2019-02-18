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
      <div :style="{ fontWeight: '500' }">
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

    <div class="audio-player--art-container">
      <loading-spinner v-if="isBuffering" />
      <img
        v-else-if="nowPlaying && albumArt"
        :src="albumArt"
        class="audio-player--art"
      />
      <img
        v-else-if="hasSpotify"
        :src="spotifyIcon"
        class="audio-player--art-placeholder spotify"
      />
      <icon
        v-else-if="hasAppleMusic"
        :glyph="appleMusicIcon"
        class="audio-player--art-placeholder apple-music"
      />
    </div>
  </div>

  <div class="audio-player" v-else-if="authenticated">
    <!-- XXX: Apple Music doesn't load if a user has Spotify enabled already!
    -->
    <apple-music-loader />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Icon from '../Icon.vue';

import SpotifyPlayer from './SpotifyPlayer.vue';
import AppleMusicPlayer from './AppleMusicPlayer.vue';
import AppleMusicLoader from './AppleMusicLoader.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const playIcon = require('../../../assets/play.svg');
const pauseIcon = require('../../../assets/pause.svg');
const nextIcon = require('../../../assets/next.svg');
const spotifyIcon = require('../../../assets/Spotify_Icon_RGB_White.png');
const appleMusicIcon = require('../../../assets/Apple_Music_Icon_wht.svg');

export default {
  components: {
    Icon,
    LoadingSpinner,
    SpotifyPlayer,
    AppleMusicPlayer,
    AppleMusicLoader,
  },

  data() {
    return {
      playIcon,
      pauseIcon,
      nextIcon,
      spotifyIcon,
      appleMusicIcon,
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
