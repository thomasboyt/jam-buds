<template>
  <transition name="modal-open" :duration="{enter: 1500, leave: 1000}">
    <div v-if="showAddSongModal" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click="handleModalClick">
        <div class="add-song-screen">
          <div :style="{textAlign: 'center'}">
            <h2>
              share a jam!
            </h2>
          </div>

          <initial-screen v-if="state === INITIAL_STATE"></initial-screen>
          <search-screen v-if="state === SEARCH_STATE"></search-screen>
          <confirm-screen v-if="state === CONFIRM_STATE"></confirm-screen>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import {
  INITIAL_STATE,
  SEARCH_STATE,
  CONFIRM_STATE,
} from '../../stores/modules/addSong';
import InitialScreen from './InitialScreen.vue';
import SearchScreen from './SearchScreen.vue';
import ConfirmScreen from './ConfirmScreen.vue';

export default {
  components: { InitialScreen, SearchScreen, ConfirmScreen },

  data() {
    return {
      INITIAL_STATE,
      SEARCH_STATE,
      CONFIRM_STATE,
    };
  },

  computed: mapState({
    showAddSongModal: (state) => state.addSong.showModal,
    state: (state) => state.addSong.state,
  }),

  methods: {
    handleOverlayClick() {
      this.$store.dispatch('closeAddSong');
    },
    handleModalClick(evt) {
      evt.stopPropagation();
    },
  },
};
</script>
