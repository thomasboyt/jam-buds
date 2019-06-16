<template>
  <draggable
    v-model="mixtapeTracks"
    handle=".drag-handle"
    tag="ul"
    class="playlist-entries"
  >
    <li v-for="songId in mixtapeTracks" :key="songId">
      <song
        :song-id="songId"
        :posted-user-names="null"
        @requestPlay="handleRequestPlay"
      >
        <template v-slot:actions v-if="isEditing">
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
</template>

<script>
import Draggable from 'vuedraggable';

import Song from '../playlist/Song.vue';
import SongRemoveFromMixtapeAction from './SongRemoveFromMixtapeAction.vue';
import Icon from '../Icon.vue';

const dragIcon = require('../../../assets/menu.svg');

export default {
  components: {
    Song,
    SongRemoveFromMixtapeAction,
    Draggable,
    Icon,
  },

  props: ['mixtapeId', 'isEditing'],

  data() {
    return {
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

      async set(songOrder) {
        try {
          await this.$store.dispatch('updateMixtapeSongOrder', {
            mixtapeId: this.mixtapeId,
            songOrder,
          });
        } catch (err) {
          this.$store.commit('showErrorModal');
          throw err;
        }
      },
    },
  },

  methods: {
    handleRequestPlay(songId) {
      this.$store.dispatch('playFromMixtape', {
        mixtapeId: this.mixtapeId,
        songId,
      });
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
