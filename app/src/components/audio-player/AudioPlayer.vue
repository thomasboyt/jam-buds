<template>
  <div class="audio-player">
    <div v-if="nowPlaying">
      <youtube v-if="nowPlaying.source === 'youtube'"
        :url="nowPlaying.youtubeUrl"
        :is-playing="isPlaying"
        @buffering="this.handleBufferingStart"
        @buffered="this.handleBufferingEnd"
        @ended="this.handlePlaybackEnded"/>
      <audio-stream v-if="nowPlaying.source === 'bandcamp'"
        :url="nowPlaying.bandcampStreamingUrl"
        :is-playing="isPlaying"
        @ended="this.handlePlaybackEnded"/>
      <audio-stream v-if="nowPlaying.source === 'soundcloud'"
        :url="nowPlaying.soundcloudStreamingUrl"
        :is-playing="isPlaying"
        @ended="this.handlePlaybackEnded"/>
    </div>

    <div class="audio-player--controls">
      <button class="play-pause-button"
        @click="handlePlayPauseClick"
        :disabled="!nowPlaying">
        <icon :glyph="playPauseIcon"/>
      </button>

      <button class="next-button"
        @click="handleNextClick"
        :disabled="!nowPlaying">
        <icon :glyph="nextIcon"/>
      </button>
    </div>

    <div class="audio-player--main">
      <div>{{ title }}</div>
      <div>{{ artist }}</div>

      <div v-if="nowPlaying">
        playing from
        <router-link :to="playbackSourcePath">{{ playbackSourceLabel }}</router-link>
      </div>
    </div>

    <div class="audio-player--art-container">
      <loading-spinner v-if="isBuffering"/>
      <img v-else-if="nowPlaying && albumArt" :src="albumArt" class="audio-player--art">
      <icon v-else
        class="audio-player--art-placeholder"
        :glyph="albumPlaceholderIcon"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Icon from '../Icon.vue';

import Youtube from './Youtube.vue';
import AudioStream from './AudioStream.vue';
import LoadingSpinner from './LoadingSpinner.vue';

const playIcon = require('../../../assets/play.svg');
const pauseIcon = require('../../../assets/pause.svg');
const nextIcon = require('../../../assets/next.svg');
const albumPlaceholderIcon = require('../../../assets/record.svg');

export default {
  components: { Icon, Youtube, AudioStream, LoadingSpinner },

  data() {
    return {
      playIcon,
      pauseIcon,
      nextIcon,
      albumPlaceholderIcon,
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

    playPauseIcon() {
      return this.isPlaying ? pauseIcon : playIcon;
    },

    artist() {
      if (this.nowPlaying) {
        return this.nowPlaying.song.artists[0];
      } else {
        return null;
      }
    },

    title() {
      if (this.nowPlaying) {
        return this.nowPlaying.song.title;
      } else {
        return '(nothing playing)';
      }
    },

    albumArt() {
      if (this.nowPlaying) {
        return this.nowPlaying.song.albumArt;
      } else {
        return null;
      }
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