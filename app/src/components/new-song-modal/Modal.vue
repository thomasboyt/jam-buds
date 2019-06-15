<template>
  <transition name="modal-open" :duration="{ enter: 400, leave: 400 }">
    <div v-if="isOpen" class="modal-overlay" @click="handleCloseModal">
      <div class="modal-content" @click="handleModalClick">
        <div class="add-song-screen">
          <div class="modal-top-row">
            <div :style="{ textAlign: 'center' }">
              <h2>
                {{ title }}
              </h2>
            </div>

            <button
              class="modal-close-button"
              type="button"
              @click="handleCloseModal"
            >
              <icon :glyph="closeIcon" />
            </button>
          </div>

          <div :style="{ flex: '1 0 auto' }">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';

import Icon from '../Icon.vue';

const closeIcon = require('../../../assets/close.svg');

export default {
  components: { Icon },

  props: ['isOpen', 'title'],

  data() {
    return {
      closeIcon,
    };
  },

  mounted() {
    disableBodyScroll();
  },

  beforeDestroy() {
    enableBodyScroll();
  },

  methods: {
    handleModalClick(evt) {
      evt.stopPropagation();
    },

    handleCloseModal() {
      this.$emit('close');
    },
  },
};
</script>
