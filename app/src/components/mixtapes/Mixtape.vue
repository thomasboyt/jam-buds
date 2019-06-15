<template>
  <div>
    <draggable
      v-model="mixtapeTracks"
      handle=".drag-handle"
      tag="ul"
      class="playlist-entries"
    >
      <li v-for="songId in mixtapeTracks" :key="songId">
        <song
          :song-id="songId"
          :playback-source-label="mixtape.title"
          :playback-source-path="`/mixtapes/${mixtapeId}`"
          :posted-user-names="null"
        >
          <template v-slot:actions>
            <song-remove-from-mixtape-action
              :song-id="songId"
              :mixtape-id="mixtapeId"
            />
            <button class="action-button drag-handle">
              <icon :glyph="dragIcon" />
            </button>
          </template>
        </song>
      </li>
    </draggable>

    <add-song-button @click="handleAddSongOpen">+ add a song</add-song-button>

    <add-to-mixtape-modal
      :mixtape-id="mixtapeId"
      :is-open="addSongOpen"
      @close="handleAddSongClose"
    />
  </div>
</template>

<script>
import Draggable from 'vuedraggable';

import Song from '../playlist/Song.vue';
import AddSongButton from '../AddSongButton.vue';
import AddToMixtapeModal from '../new-song-modal/AddToMixtapeModal.vue';
import SongRemoveFromMixtapeAction from './SongRemoveFromMixtapeAction.vue';
import Icon from '../Icon.vue';

const dragIcon = require('../../../assets/menu.svg');

export default {
  components: {
    Song,
    AddSongButton,
    AddToMixtapeModal,
    SongRemoveFromMixtapeAction,
    Draggable,
    Icon,
  },

  props: ['mixtapeId'],

  data() {
    return {
      addSongOpen: false,
      dragIcon,
    };
  },

  computed: {
    mixtape() {
      return this.$store.getters.getMixtape(this.mixtapeId);
    },

    mixtapeTracks: {
      get() {
        return this.mixtape.tracks;
      },

      set(songOrder) {
        this.$store.dispatch('updateMixtapeSongOrder', {
          mixtapeId: this.mixtapeId,
          songOrder,
        });
      },
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

<style lang="scss" scoped>
ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
}
</style>
