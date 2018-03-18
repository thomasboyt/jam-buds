<template>
  <div class="audio-player">
    <div v-if="nowPlaying">
      <youtube v-if="nowPlaying.source === 'youtube'"
        :url="nowPlaying.youtubeUrl"
        :isPlaying="isPlaying"
        @ended="this.handlePlaybackEnded">
      </youtube>
      <audio-stream v-if="nowPlaying.source === 'bandcamp'"
        :url="nowPlaying.bandcampStreamingUrl"
        :isPlaying="isPlaying"
        @ended="this.handlePlaybackEnded">
      </audio-stream>
      <audio-stream v-if="nowPlaying.source === 'soundcloud'"
        :url="nowPlaying.soundcloudStreamingUrl"
        :isPlaying="isPlaying"
        @ended="this.handlePlaybackEnded">
      </audio-stream>
    </div>

    <div class="audio-player--controls">
      <button class="play-pause-button" @click="handlePlayPauseClick"
        :disabled="!nowPlaying">
        <icon :glyph="playPauseIcon"></icon>
      </button>

      <button class="next-button" @click="handleNextClick"
        :disabled="!nowPlaying">
        <icon :glyph="nextIcon"></icon>
      </button>
    </div>

    <div class="audio-player--main">
      <div>{{title}}</div>
      <div>{{artist}}</div>

      <div v-if="nowPlaying">
        playing from
        <router-link :to="playbackSourcePath">{{playbackSourceLabel}}</router-link>
      </div>
    </div>

    <img v-if="nowPlaying && albumArt" :src="albumArt" class="audio-player--art">
    <icon v-else class="audio-player--art -placeholder"
      :glyph="albumPlaceholderIcon"></icon>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import Icon from '../Icon.vue';

  import Youtube from './Youtube.vue';
  import AudioStream from './AudioStream.vue';

  const playIcon = require('../../../assets/play.svg');
  const pauseIcon = require('../../../assets/pause.svg');
  const nextIcon = require('../../../assets/next.svg');
  const albumPlaceholderIcon = require('../../../assets/record.svg');

  export default {
    data() {
      return {
        playIcon,
        pauseIcon,
        nextIcon,
        albumPlaceholderIcon,
      }
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
      handleNextClick() {
      },
      handlePlaybackEnded() {
        this.$store.dispatch('playback/clearPlayback')
      }
    },

    components: {Icon, Youtube, AudioStream},
  };
</script>