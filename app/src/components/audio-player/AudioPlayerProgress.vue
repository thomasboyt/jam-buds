<template>
  <div class="progress">
    <span>{{ secondsElapsedDisplayed }}</span>
    <audio-player-progress-bar :progress="progress" class="progress-bar" />
    <span>{{ secondsTotalDisplayed }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AudioPlayerProgressBar from './AudioPlayerProgressBar.vue';

function formatTime(sec: number): string {
  const mins = Math.floor(sec / 60);
  const secs = (sec % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default Vue.extend({
  components: { AudioPlayerProgressBar },

  data() {
    return {
      sinceElapsed: 0,
      interval: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    secondsElapsed(): number | null {
      return this.$accessor.playback.secondsElapsed;
    },
    secondsTotal(): number | null {
      return this.$accessor.playback.secondsTotal;
    },
    useLocalTimer(): boolean {
      return this.$accessor.playback.player === 'spotify';
    },
    isPlaybackProgressing(): boolean {
      return (
        this.$accessor.playback.isPlaying &&
        !this.$accessor.playback.isBuffering
      );
    },
    secondsElapsedDisplayed(): string {
      return formatTime(this.secondsElapsed! + this.sinceElapsed);
    },
    secondsTotalDisplayed(): string {
      return formatTime(this.secondsTotal!);
    },
    progress(): number {
      return (this.secondsElapsed! + this.sinceElapsed) / this.secondsTotal!;
    },
  },

  watch: {
    isPlaybackProgressing(newV, oldV) {
      if (newV && !oldV) {
        // now progressing, start the clock
        this.startTimer();
      }
      if (!newV && oldV) {
        // stopped progressing, stop the clock
        this.clearTimer();
      }
    },
    secondsElapsed(newV, oldV) {
      if (newV !== oldV) {
        this.sinceElapsed = 0;
        if (this.isPlaybackProgressing) {
          this.clearTimer();
          this.startTimer();
        }
      }
    },
  },

  mounted() {
    if (this.isPlaybackProgressing) {
      this.startTimer();
    }
  },

  destroyed() {
    this.clearTimer();
  },

  methods: {
    startTimer(): void {
      if (!this.useLocalTimer) {
        return;
      }
      this.interval = setInterval(() => {
        this.sinceElapsed += 1;
      }, 1000);
    },
    clearTimer(): void {
      if (this.interval) {
        clearInterval(this.interval);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

@media (max-width: $breakpoint-small) {
  .progress {
    position: absolute;
    top: 1px;
    left: 0;
    width: 100%;

    span {
      display: none;
    }
  }
}

@media (min-width: $breakpoint-small) {
  .progress {
    width: 100%;

    color: white;
    font-size: 12px;
    text-align: center;
    margin-top: 3px;

    display: flex;
    align-items: center;

    span {
      flex: 0 0 40px;
    }

    span:first-child {
      text-align: right;
    }

    span:last-child {
      text-align: left;
    }
  }

  .progress-bar {
    margin: 0 10px;
  }
}
</style>
