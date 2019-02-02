<template>
  <div v-if="notEmbeddable">
    <p>
      You tried to share the song "{{ shareTitle }}" via {{ shareSourceName }},
      but unfortunately, this song can't be embedded on Jam Buds due to
      restrictions set by the song's uploader.
    </p>
    <p>
      We recommend trying to find another source for this song!
    </p>
    <a @click="handleReturnToInitialScreen" href="#">
      Try again
    </a>
  </div>

  <div v-else>
    <p>You're sharing the link "{{ shareTitle }}" via {{ shareSourceName }}.</p>

    <div v-if="manualEntry">
      <manual-entry-form />

      Or
      <a @click="handleToggleManualEntry" href="#">
        search for a song
      </a>
    </div>

    <div v-else>
      <spotify-search />

      Or
      <a @click="handleToggleManualEntry" href="#" data-test="use-manual-entry">
        manually enter a title and artist
      </a>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import SpotifySearch from './SpotifySearch.vue';
import ManualEntryForm from './ManualEntryForm.vue';

export default {
  components: { SpotifySearch, ManualEntryForm },

  data() {
    return {};
  },

  computed: {
    ...mapState({
      shareTitle: (state) => state.addSong.shareTitle,
      shareSourceName: (state) => state.addSong.shareSourceName,
      notEmbeddable: (state) => !state.addSong.shareEmbeddable,
      manualEntry: (state) => state.addSong.manualEntry,
    }),
  },

  methods: {
    handleReturnToInitialScreen(evt) {
      evt.preventDefault();
      this.$store.dispatch('resetAddSong');
    },
    handleToggleManualEntry(evt) {
      evt.preventDefault();
      this.$store.dispatch('toggleAddSongManualEntry');
    },
  },
};
</script>
