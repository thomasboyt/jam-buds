<template>
  <div class="album-art-container">
    <img v-if="albumArt" class="album-art" :src="albumArt" />
    <icon v-else class="album-art -placeholder" :glyph="albumPlaceholderIcon" />

    <div v-if="overlayIcon" class="album-art-overlay">
      <icon
        :class="['playing-icon', { 'is-playing': isPlaying }]"
        :glyph="overlayIcon"
      />
    </div>
  </div>
</template>

<script>
import Icon from '../Icon.vue';
const albumPlaceholderIcon = require('~/assets/record.svg');
const playIcon = require('~/assets/play-filled.svg');
const youtubeIcon = require('~/assets/youtube.svg');
const bandcampIcon = require('~/assets/bandcamp-circle.svg');

export default {
  components: { Icon },

  props: ['albumArt', 'isPlaying', 'isHovering', 'canPlay', 'openInService'],

  data() {
    return {
      albumPlaceholderIcon,
    };
  },

  computed: {
    overlayIcon() {
      // inline playback current or possible for this song with current service
      if (this.isPlaying || (this.isHovering && this.canPlay)) {
        return playIcon;
      }

      if (this.isHovering) {
        // TODO: maybe add apple/spotify logos here? but they'd never be seen on mobile
        // anyways so shrug
        if (this.openInService === 'bandcamp') {
          return bandcampIcon;
        }
        if (this.openInService === 'youtube') {
          return youtubeIcon;
        }
      }

      return null;
    },
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
  display: block;

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
  background: rgba(0, 0, 0, 0.3);
}

.playing-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  padding: 5px;
  top: calc(50% - 20px);
  left: calc(50% - 20px);

  color: white;
  border: 2px transparent solid;
  border-radius: 40px;

  &.is-playing {
    border-color: white;
    transition: 0.15s border-color ease-out;
  }
}
</style>
