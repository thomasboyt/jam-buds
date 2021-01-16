<template>
  <div class="wrapper">
    <transition name="fade">
      <div class="fade-screen" v-if="state === INITIAL_STEP" key="initial">
        <!-- todo: is there a better way to pass down a slot? -->
        <sign-in-initial @ctaClicked="handleClickInitialCta">
          <template #initial-copy>
            <slot name="initial-copy" />
          </template>
        </sign-in-initial>
      </div>
      <div class="fade-screen" v-if="state === FORM_STEP" key="form">
        <sign-in-form @sentMail="handleSentMail" />
      </div>
      <div class="fade-screen" v-if="state === SUCCESS_STEP" key="success">
        <sign-in-success :sent-email="sentEmail" />
      </div>
    </transition>
  </div>
</template>

<script>
import SignInForm from './SignInForm.vue';
import SignInInitial from './SignInInitial.vue';
import SignInSuccess from './SignInSuccess.vue';

const INITIAL_STEP = 'initial';
const FORM_STEP = 'form';
const SUCCESS_STEP = 'success';

export default {
  components: { SignInInitial, SignInForm, SignInSuccess },

  data() {
    return {
      state: INITIAL_STEP,
      sentEmail: null,
      INITIAL_STEP,
      FORM_STEP,
      SUCCESS_STEP,
    };
  },

  methods: {
    handleClickInitialCta() {
      this.state = FORM_STEP;
    },

    handleSentMail(email) {
      this.sentEmail = email;
      this.state = SUCCESS_STEP;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.wrapper {
  position: relative;
}

.fade-screen {
  position: absolute;

  // needed for vertical align in two column view for some reason
  @media (min-width: $breakpoint-small) {
    top: 50%;
    transform: translate(0, -50%);
  }
}

.fade-enter-active {
  transition: opacity 0.25s ease 0.25s;
}

.fade-leave-active {
  transition: opacity 0.25s ease;
  opacity: 0;
}

.fade-enter {
  opacity: 0;
}
</style>
