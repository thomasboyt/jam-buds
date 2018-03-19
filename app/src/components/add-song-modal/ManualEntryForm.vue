<template>
  <form class="submit-box" @submit="handleSubmit">
    <input type="text" name="artist" placeholder="Artist" v-model="artist">
    <input type="text" name="title" placeholder="Title" v-model="title">

    <button type="submit" :disabled="!isFilled">
      next
    </button>
  </form>
</template>

<script>
import {mapState} from 'vuex';

export default {
  data() {
    return {
      artist: '',
      title: '',
    };
  },

  mounted() {
    if (this.manualEntrySuggestion) {
      this.artist = this.manualEntrySuggestion.artist;
      this.title = this.manualEntrySuggestion.title;
    }
  },

  computed: {
    isFilled() {
      return this.artist.length && this.title.length;
    },
    ...mapState({
      manualEntrySuggestion: (state) => state.addSong.manualEntrySuggestion,
    }),
  },

  methods: {
    handleSubmit(evt) {
      evt.preventDefault();
      const {artist, title} = this;
      this.$store.dispatch('submitManualEntry', {artist, title});
    },
  },
}
</script>