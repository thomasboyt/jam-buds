<template>
  <div class="audio-player--song-display">
    <div class="audio-player--art-container">
      <img v-if="albumArt" :src="albumArt" class="audio-player--art" />
      <icon
        v-else
        :glyph="placeholderIcon"
        class="audio-player--art-placeholder"
      />
    </div>
    <div class="audio-player--label-container">
      <div :style="{ fontWeight: '600' }">
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
  </div>
</template>

<script>
import Icon from '../Icon.vue';

const placeholderIcon = require('../../../assets/record.svg');

export default {
  components: {
    Icon,
  },

  props: ['song', 'playbackSourcePath', 'playbackSourceLabel'],

  data() {
    return {
      placeholderIcon,
    };
  },

  computed: {
    artist() {
      return this.song.artists[0];
    },

    title() {
      return this.song.title;
    },

    albumArt() {
      return this.song.albumArt;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/mixins.scss';

.audio-player--song-display {
  display: flex;
  min-width: 0;
  max-width: 100%;
}

.audio-player--label-container {
  // needed for proper wrapping
  max-width: 100%;

  color: white;
  padding: 10px 15px;
  font-size: 14px;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a {
    color: $yellow;
  }
}

.audio-player--art-container {
  flex: 0 0 80px;
  height: 100%;
  width: 80px;
  padding: 10px;

  .audio-player--art {
    width: 100%;
  }

  img.audio-player--art-placeholder {
    padding: 10px;
    width: 100%;
  }

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
