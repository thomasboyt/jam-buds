<template>
  <ul class="playlist-entries">
    <li v-for="songId in mixtape.tracks" :key="songId">
      <song
        :song-id="songId"
        :playback-source-label="mixtape.title"
        :playback-source-path="`/mixtapes/${mixtapeId}`"
        :posted-user-names="null"
      >
        <template v-slot:actions>
          hello!
        </template>
      </song>
    </li>
  </ul>
</template>

<script>
import Song from './playlist/Song.vue';

export default {
  components: { Song },

  props: ['mixtapeId'],

  computed: {
    mixtape() {
      return this.$store.getters.getMixtape(this.mixtapeId);
    },
  },
};
</script>