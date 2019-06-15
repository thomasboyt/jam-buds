<template>
  <div>
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

    <add-song-button @click="handleAddSongOpen">+ add a song</add-song-button>

    <add-to-mixtape-modal
      :mixtape-id="mixtapeId"
      :is-open="addSongOpen"
      @close="handleAddSongClose"
    />
  </div>
</template>

<script>
import Song from './playlist/Song.vue';
import AddSongButton from './AddSongButton.vue';
import AddToMixtapeModal from './new-song-modal/AddToMixtapeModal.vue';

export default {
  components: { Song, AddSongButton, AddToMixtapeModal },

  props: ['mixtapeId'],

  data() {
    return {
      addSongOpen: false,
    };
  },

  computed: {
    mixtape() {
      return this.$store.getters.getMixtape(this.mixtapeId);
    },
  },

  methods: {
    handleAddSongOpen() {
      this.addSongOpen = true;
    },
    handleAddSongClose() {
      this.addSongOpen = false;
    },
  },
};
</script>
