<template>
  <div ref="container"></div>
</template>

<script>
/* global MusicKit */

export default {
  props: ['appleMusicId', 'isPlaying'],

  data() {
    return {
      ready: false,
      music: MusicKit.getInstance(),
    };
  },

  watch: {
    isPlaying(newVal) {
      if (!newVal) {
        // Pause
        this.music.pause();
      } else {
        // Play
        this.music.play();
      }
    },

    appleMusicId(newVal) {
      // Change songs
      this.setSong(newVal);
    },
  },

  mounted() {
    this.setSong(this.appleMusicId);

    this.music.addEventListener(
      'playbackStateDidChange',
      this.onPlaybackStateChange
    );
  },

  beforeDestroy() {
    this.music.removeEventListener(
      'playbackStateDidChange',
      this.onPlaybackStateChange
    );
  },

  methods: {
    onPlaybackStateChange(evt) {
      if (
        evt.state === MusicKit.PlaybackStates.loading ||
        evt.state === MusicKit.PlaybackStates.waiting ||
        evt.state === MusicKit.PlaybackStates.stalled ||
        evt.state === MusicKit.PlaybackStates.seeking
      ) {
        this.$emit('buffering');
      } else {
        this.$emit('buffered');
      }

      // XXX: This is a stupid fucking workaround to a stupid fucking bug:
      // https://forums.developer.apple.com/thread/117043
      if (evt.state === MusicKit.PlaybackStates.ended) {
        this.ended = true;
      }
      if (evt.state === MusicKit.PlaybackStates.waiting && this.ended) {
        console.log('Preventing replaying just-ended song!');
        this.music.stop();
        this.$emit('ended');
      }
      // just in case apple ever fixes this bug, this should work
      if (evt.state === MusicKit.PlaybackStates.completed) {
        this.$emit('ended');
      }
    },

    async setSong(appleMusicId) {
      if (!appleMusicId) {
        this.music.stop();
        return;
      }

      this.$emit('buffering');

      await this.music.setQueue({
        song: appleMusicId,
      });

      await this.music.play();
    },
  },
};
</script>
