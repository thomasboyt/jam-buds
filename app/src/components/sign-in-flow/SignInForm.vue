<template>
  <div>
    <sign-in-header>sign up or log in</sign-in-header>

    <form @submit="handleSubmit">
      <input
        type="email"
        v-model="email"
        placeholder="enter ur email..."
        aria-label="Email"
      />

      <button type="submit" class="submit" :disabled="requestInFlight">
        let's go!
      </button>
    </form>

    <p class="email-note">
      (fyi: your email stays with us, and will only be used for authentication
      unless you opt-in to other emails, like our infrequently-published
      newsletter)
    </p>
  </div>
</template>

<script>
import SignInHeader from './SignInHeader.vue';

export default {
  components: { SignInHeader },

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

form {
  display: flex;
  width: 100%;
}

input {
  min-width: 0;
  flex-basis: 100%;
  padding: 0px $spacing-2xs;
  margin-right: $spacing-2xs;
}

.submit {
  flex: 0 0 auto;
  padding: 0 $spacing-xs;
}

input,
.submit {
  height: $spacing-3xl;
}

input {
  @media (max-width: $breakpoint-small) {
    font-size: $text-base;
  }
  @media (min-width: $breakpoint-small) {
    font-size: $text-lg;
  }
}

.submit {
  font-size: $text-lg;
  background: yellow;
  color: black;
  font-weight: bold;
}

.email-note {
  font-size: $text-xs;
  margin-top: $spacing-sm;
}
</style>
