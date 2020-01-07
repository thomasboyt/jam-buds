<template>
  <div class="album-art-container">
    <img v-if="albumArt" class="album-art" :src="albumArt" />
    <icon v-else class="album-art -placeholder" :glyph="albumPlaceholderIcon" />

    <transition name="overlay-animation">
      <div v-if="isPlaying" class="album-art-overlay">
        <icon class="playing-icon" :glyph="playIcon" />
      </div>
    </transition>
  </div>
</template>

<script>
import Icon from '../Icon.vue';
const albumPlaceholderIcon = require('../../../assets/record.svg');
const playIcon = require('../../../assets/play-filled.svg');

export default {
  components: { Icon },

  props: ['albumArt', 'isPlaying'],

  data() {
    return {
      albumPlaceholderIcon,
      playIcon,
    };
  },
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.album-art-container {
  flex: 0 0 auto;
  position: relative;
  margin-right: 20px;
}

.album-art {
  width: 64px;
  height: auto;
  border: 1px black solid;

  &.-placeholder {
    border: none;
    height: 64px;
  }
}

@media (max-width: $breakpoint-small) {
  .album-art-container {
    margin-right: 10px;
  }
  .album-art {
    width: 54px;

    &.-placeholder {
      height: 54px;
    }
  }
}

.album-art-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.playing-icon {
  position: absolute;
  top: calc(50% - 15px);
  left: calc(50% - 15px);
  width: 30px;
  height: 30px;
  color: white;
}

.overlay-animation-enter,
.overlay-animation-leave-to {
  opacity: 0;
}

.overlay-animation-enter-active,
.overlay-animation-leave-active {
  // kept in sync w/ <audio-player-bar /> open animation time
  transition: opacity 0.2s cubic-bezier(0, 0, 0.2, 1);
}
</style>
