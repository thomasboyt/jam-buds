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
      <div :style="{ fontWeight: '600' }">{{ artist }}</div>
      <div>{{ title }}</div>

      <div>
        from
        <nuxt-link :to="playbackSourcePath">
          {{ playbackSourceLabel }}
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'; // eslint-disable-line import/named
import { ApiSchema } from '~/api/_helpers';
import Icon from '../Icon.vue';

import placeholderIcon from '~/assets/record.svg';

export default Vue.extend({
  components: {
    Icon,
  },

  // props: ['song', 'playbackSourcePath', 'playbackSourceLabel'],
  props: {
    song: {
      type: Object as PropType<ApiSchema<'SongWithMeta'>>,
      required: true,
    },
    playbackSourcePath: {
      type: String,
      required: true,
    },
    playbackSourceLabel: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      placeholderIcon,
    };
  },

  computed: {
    artist(): string {
      return this.song.artists[0];
    },

    title(): string {
      return this.song.title;
    },

    albumArt(): string | undefined {
      return this.song.albumArt;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.audio-player--song-display {
  display: flex;
  height: 100%;
  align-items: center;

  margin-left: 10px;
  margin-right: auto;
  @media (min-width: $breakpoint-small) {
    margin: 0;
  }
}

.audio-player--label-container {
  // needed for proper wrapping
  max-width: 100%;

  color: white;
  font-size: 14px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  position: relative;

  .audio-player--art {
    width: 100%;
  }

  svg.audio-player--art-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    fill: white;
  }

  @media (max-width: $breakpoint-small) {
    display: none;
  }
}
</style>
