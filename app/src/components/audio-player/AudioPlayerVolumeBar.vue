<template>
  <div class="wrapper">
    <icon :glyph="volumeIcon" class="volume-icon" />
    <input
      type="range"
      role="slider"
      min="0"
      max="1"
      step="0.05"
      :value="volume"
      @change="handleChangeVolume"
    />
  </div>
</template>

<script>
import Icon from '../Icon.vue';

const volumeIcon = require('~/assets/volume.svg');

export default {
  components: { Icon },

  data() {
    return {
      volumeIcon,
    };
  },

  computed: {
    volume() {
      return this.$accessor.playback.volume;
    },
  },

  methods: {
    handleChangeVolume(e) {
      this.$store.dispatch('playback/changeVolume', parseFloat(e.target.value));
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;

  .volume-icon,
  input {
    flex: 0 0 auto;
  }
}

.volume-icon {
  width: 20px;
  margin-right: 10px;
  color: #999;
}

@mixin volume-track {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #777;
}

@mixin volume-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 9999px;
  background: #ffffff;
  cursor: pointer;
}

input {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  width: 100px;
  height: 12px;
  display: inline-block;
  cursor: pointer;

  &::-moz-range-track {
    @include volume-track();
  }
  &::-webkit-slider-runnable-track {
    @include volume-track();
  }

  &::-webkit-slider-thumb {
    @include volume-thumb();
    margin-top: -4px;
  }
  &::-moz-range-thumb {
    @include volume-thumb();
  }
}
</style>
