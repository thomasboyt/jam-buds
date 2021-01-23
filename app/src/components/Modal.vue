<template>
  <transition name="modal-open" :duration="{ enter: 400, leave: 400 }">
    <div v-if="isOpen" class="modal-overlay" @click="handleCloseModal">
      <div class="modal" @click="handleModalClick">
        <div class="modal-content">
          <div class="modal-top-row">
            <div :style="{ textAlign: 'center' }">
              <h2>{{ title }}</h2>
            </div>

            <button
              class="modal-close-button"
              type="button"
              @click="handleCloseModal"
            >
              <icon :glyph="closeIcon" />
            </button>
          </div>

          <div :style="{ flex: '1 0 auto', position: 'relative' }">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';
import Icon from './Icon.vue';
import { closeModal } from '~/util/modal';

const closeIcon = require('~/assets/close.svg');

export default {
  components: { Icon },

  props: ['title', 'isOpen'],

  data() {
    return {
      closeIcon,
    };
  },

  watch: {
    isOpen(isOpen) {
      if (isOpen) {
        disableBodyScroll();
      } else {
        enableBodyScroll();
      }
    },
  },

  beforeDestroy() {
    enableBodyScroll();
  },

  methods: {
    handleModalClick(evt) {
      evt.stopPropagation();
    },

    handleCloseModal() {
      closeModal(this.$router, this.$route);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';
@import '~/assets/styles/z-index.scss';

$modal-width: 450px;
$modal-height: 550px;

.modal {
  overflow: auto;

  background: $lighter-black;
  color: rgb(225, 225, 225);

  position: absolute;
  z-index: $z-modal;

  padding: 20px;

  @media (max-width: $breakpoint-small) {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding-top: max(env(safe-area-inset-top, 0px), 20px);
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px);
  }

  @media (min-width: $breakpoint-small) {
    border-radius: 10px;
    width: $modal-width;
    height: $modal-height;
    top: 50%;
    left: 50%;
    margin-top: -$modal-height/2;
    margin-left: -$modal-width/2;
  }

  outline: none;
}

.modal-content {
  min-height: 100%;
  display: flex;
  flex-flow: column;
  position: relative;

  ::v-deep a,
  a:visited,
  a:hover,
  a:active {
    color: rgb(225, 225, 225);
  }

  .header-container {
    text-align: center;
  }

  h2 {
    display: inline-block;
    margin-top: 0;
    margin-bottom: 25px;
    font-size: 32px;
    font-weight: 600;
    line-height: 40px;
    background: $post-song-gradient;
    -webkit-background-clip: text;
    background-clip: text;
    color: rgba(255, 255, 255, 0.2);
  }

  .modal-top-row {
    position: relative;
  }

  .modal-close-button {
    position: absolute;
    top: 5px;
    padding: 0px;
    color: white;

    svg {
      width: 30px;
      height: 30px;
    }

    @media (min-width: $breakpoint-small) {
      right: 0px;
    }
  }
}

@media (max-width: $breakpoint-small) {
  .modal-open-enter-active .modal {
    transition: transform 400ms cubic-bezier(0, 0, 0.2, 1);
  }

  .modal-open-leave-active .modal {
    transition: transform 250ms cubic-bezier(0.4, 0, 1, 1);
  }

  .modal-open-enter .modal,
  .modal-open-leave-to .modal {
    transform: translate3d(0, 100vh, 0);
  }
}

@media (min-width: $breakpoint-small) {
  .modal-open-enter-active .modal {
    animation: desktopModalAppear 400ms cubic-bezier(0, 0, 0.2, 1);
  }

  .modal-open-leave-active .modal {
    animation: desktopModalLeave 250ms cubic-bezier(0.4, 0, 1, 1);
  }

  .modal-open-leave-to .modal {
    opacity: 0;
  }
}

@keyframes desktopModalAppear {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes desktopModalLeave {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
