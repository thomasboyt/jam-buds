<template>
  <div class="progress">
    <span>{{ secondsElapsedDisplayed }}</span>
    <audio-player-progress-bar :progress="progress" class="progress-bar" />
    <span>{{ secondsTotalDisplayed }}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AudioPlayerProgressBar from './AudioPlayerProgressBar';

function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = (sec % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default {
  components: { AudioPlayerProgressBar },

  data() {
    return {
      sinceElapsed: 0,
    };
  },

  computed: {
    ...mapState('playback', [
      'player',
      'secondsElapsed',
      'secondsTotal',
      'isPlaying',
      'isBuffering',
    ]),
    useLocalTimer() {
      return this.player === 'spotify';
    },
    isPlaybackProgressing() {
      return this.isPlaying && !this.isBuffering;
    },
    secondsElapsedDisplayed() {
      return formatTime(this.secondsElapsed + this.sinceElapsed);
    },
    secondsTotalDisplayed() {
      return formatTime(this.secondsTotal);
    },
    progress() {
      return (this.secondsElapsed + this.sinceElapsed) / this.secondsTotal;
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

  unmounted() {
    this.clearTimer();
  },

  methods: {
    startTimer() {
      if (!this.useLocalTimer) {
        return;
      }
      this.interval = setInterval(() => {
        this.sinceElapsed += 1;
      }, 1000);
    },
    clearTimer() {
      if (!this.useLocalTimer) {
        return;
      }
      clearInterval(this.interval);
    },
  },
};
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
