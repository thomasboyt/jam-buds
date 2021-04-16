<template>
  <div>
    <draggable v-model="mixtapeTracks" handle=".drag-handle" tag="ul">
      <li v-for="songId in mixtapeTracks" :key="songId">
        <song
          :song-id="songId"
          :posts="null"
          @requestPlay="handleRequestPlay"
          :like-source-params="{
            likeSource: 'mixtape',
            sourceMixtapeId: mixtapeId,
          }"
        >
          <template #actions v-if="isEditing">
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
  </div>
</template>

<script>
import Draggable from 'vuedraggable';

import Song from '../playlist/Song.vue';
import SongRemoveFromMixtapeAction from './SongRemoveFromMixtapeAction.vue';
import Icon from '../Icon.vue';

const dragIcon = require('~/assets/menu.svg');

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
      return this.$accessor.mixtapes.getMixtape(this.mixtapeId);
    },

    mixtapeTracks: {
      get() {
        return this.mixtape.tracks;
      },

      async set(songOrder) {
        try {
          await this.$store.dispatch('mixtapes/updateMixtapeSongOrder', {
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
      this.$store.dispatch('playback/playFromMixtape', {
        mixtapeId: this.mixtapeId,
        mixtapeSlug: this.mixtape.slug,
        songId,
      });
    },
  },
};
</script>
