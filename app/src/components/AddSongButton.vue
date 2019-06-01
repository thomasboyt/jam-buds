<template>
  <button class="add-song" @click="handleClick" data-test="add-song">
    <span class="label">
      + post a song!
    </span>
  </button>
</template>

<script>
export default {
  methods: {
    handleClick() {
      this.$store.dispatch('showAddSong');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins.scss';
@import '../../styles/z-index.scss';

button.add-song {
  display: block;
  padding: 10px 15px;

  font-weight: 600;
  background: $black;
  border-radius: 100px;

  font-size: 20px;

  &:active {
    transform: translate3d(4px, 4px, 0px);
  }

  .label {
    background: $post-song-gradient;
    -webkit-background-clip: text;
    background-clip: text;
    color: rgba(255, 255, 255, 0.2);
  }

  &:hover .label {
    color: rgba(255, 255, 255, 0.5);
  }
}

@media (max-width: $breakpoint-small) {
  button.add-song {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: $z-floating-button;

    padding: 15px 20px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);

    transition: 0.2s bottom cubic-bezier(0, 0, 0.2, 1);
  }

  body.with-audio-player button.add-song {
    bottom: 100px;
  }
}
</style>
