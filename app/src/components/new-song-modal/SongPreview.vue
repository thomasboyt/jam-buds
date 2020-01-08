<template>
  <div class="song">
    <div class="album-art-container">
      <img :src="song.albumArt" class="album-art" />
    </div>
    <div class="song-label">
      <div class="song-label-content">
        <span class="artist">{{ song.artists.join(', ') }}</span>
        <br />
        <span class="title">{{ song.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['song'],
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.song {
  text-align: left;
  display: flex;
  align-items: center;
  line-height: 24px;

  .album-art-container {
    flex: 0 0 auto;

    img {
      width: 64px;
      height: auto;
      border: 1px black solid;
    }
  }

  .song-label {
    min-width: 0;
    margin-left: 10px;

    .song-label-content {
      display: inline-block;
      overflow: hidden;
      width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .artist {
      font-weight: 500;
    }
  }

  @media (max-width: $breakpoint-small) {
    font-size: 14px;
    line-height: 20px;
  }
}
</style>
