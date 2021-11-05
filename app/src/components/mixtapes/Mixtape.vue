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
    <item-detail-modal />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Draggable from 'vuedraggable';

import { MixtapeHydrated } from '~/store/mixtapes';
import Song from '../playlist/Song.vue';
import SongRemoveFromMixtapeAction from './SongRemoveFromMixtapeAction.vue';
import Icon from '../Icon.vue';
import ItemDetailModal from '../item-detail-modal/ItemDetailModal.vue';

import dragIcon from '~/assets/menu.svg';

export default Vue.extend({
  components: {
    Song,
    SongRemoveFromMixtapeAction,
    Draggable,
    Icon,
    ItemDetailModal,
  },

  props: {
    mixtapeId: {
      type: Number,
      required: true,
    },
    isEditing: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      dragIcon,
    };
  },

  computed: {
    mixtape(): MixtapeHydrated {
      return this.$accessor.mixtapes.getMixtape(this.mixtapeId)!;
    },

    mixtapeTracks: {
      get(): number[] {
        return this.mixtape.tracks;
      },

      async set(songOrder: number[]): Promise<void> {
        try {
          await this.$accessor.mixtapes.updateMixtapeSongOrder({
            mixtapeId: this.mixtapeId,
            songOrder,
          });
        } catch (err) {
          this.$accessor.showErrorModal();
          throw err;
        }
      },
    },
  },

  methods: {
    handleRequestPlay(songId: number) {
      this.$accessor.playback.playFromMixtape({
        mixtapeId: this.mixtapeId,
        mixtapeSlug: this.mixtape.slug,
        songId,
      });
    },
  },
});
</script>
