<template>
  <div>
    <sign-in-header>hiya!</sign-in-header>

    <p class="label">
      enter your email here and we'll send you a
      {{ codeOrLink }} to sign up or log back in:
    </p>

    <form @submit="handleSubmit">
      <input
        type="email"
        v-model="email"
        placeholder="enter ur email..."
        aria-label="Email"
      />

      <jb-button
        button-style="page-action full-width"
        type="submit"
        :disabled="requestInFlight"
      >
        continue
      </jb-button>
    </form>

    <p class="email-note">
      (fyi: your email stays with us, and will only be used for authentication
      unless you opt-in to other emails, like our infrequently-published
      newsletter)
    </p>
  </div>
</template>

<script>
import JbButton from '../lib/JbButton.vue';
import SignInHeader from './SignInHeader.vue';

export default {
  components: { JbButton, SignInHeader },

  data() {
    return {
      email: '',
      requestInFlight: false,
    };
  },

  computed: {
    // send code instead of magic link on mobile
    shouldSendCode() {
      const ua = navigator.userAgent;
      return (
        (ua.match(/iPhone|iPad|iPod/) ||
          ua.match(/Android/) ||
          // iPad Safari sometimes pretends to be desktop Safari
          (ua.match(/Safari/) &&
            !ua.match(/Edg\//) &&
            navigator.maxTouchPoints > 1)) !== null
      );
    },
    codeOrLink() {
      return this.shouldSendCode ? 'code' : 'link';
    },
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const email = this.email;

      let resp;
      try {
        this.requestInFlight = true;

        resp = await this.$axios.post('sign-in-token', {
          email,
          signupReferral: this.$route.query['signup-ref'],
          sendCodeInsteadOfLink: this.shouldSendCode,
        });
      } catch (err) {
        this.requestInFlight = false;

        this.$store.commit('showErrorModal');
        throw err;
      }

      this.$emit('sentMail', { email, sentCode: this.shouldSendCode });

      if (this.$config.DANGER_SKIP_AUTH) {
        if (resp.data.isRegistration) {
          document.location = `/welcome/registration?t=${resp.data.token}`;
        } else {
          document.location = `/sign-in?t=${resp.data.token}`;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.label {
  font-size: $text-md;
  line-height: $leading-normal;
  margin-bottom: $spacing-lg;

  @media (max-width: $breakpoint-small) {
    text-align: center;
  }
}

form {
  margin: 0 auto;
}

input {
  width: 100%;
  padding: 0px $spacing-2xs;
  margin-bottom: $spacing-lg;
  height: $spacing-3xl;

  @media (max-width: $breakpoint-small) {
    font-size: $text-base;
  }
  @media (min-width: $breakpoint-small) {
    font-size: $text-lg;
  }
}

.email-note {
  font-size: $text-xs;
  margin-top: $spacing-sm;
}
</style>
