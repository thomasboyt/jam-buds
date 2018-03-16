<template>
  <div :class="['playlist-entry', {'is-playing': isPlaying}]">
    <a class="playlist-entry--main" :href="entry.sourceUrl" target="_blank" rel="noopener noreferrer" @click="handleClick">
      <!-- <album-art :song="entry.song"></album-art> -->
      <div class="title">
        <div class="title-content">
          {{entry.song.artists.join(',')}}
          <br />
          {{entry.song.title}}
        </div>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: ['entry'],

  data() {
    return {
      isOpen: false,

      // TODO: get this from store
      isPlaying: false,
    };
  },

  methods: {
    handleClick(evt) {
      // play the song
      evt.preventDefault();
      //this.handleRequestPlay();
      this.isOpen = true;
    }
  }
}
</script>

<style>
  .playlist-entry  {
    background-color: rgb(255, 255, 166);
    color: black;
  }
</style>