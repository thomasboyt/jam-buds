<template>
  <div>
    <sign-in-header>enter sign-in code</sign-in-header>

    <p>
      Check your inbox at
      <strong>{{ sentEmail }}</strong>
      for a 6-digit code.
    </p>

    <form @submit="handleSubmit">
      <input
        type="text"
        v-model="code"
        placeholder="enter code..."
        aria-label="Code"
      />

      <button type="submit" class="submit" :disabled="requestInFlight">
        next
      </button>
    </form>

    <p v-if="error">{{ error }}</p>

    <p class="email-note">
      please allow up to 5 minutes for the email to arrive. due to strange
      forces of computers outside of our control, sometimes our emails may go to
      your "spam" folder, or, in Gmail, the "Promotions" tab.
    </p>
  </div>
</template>

<script>
import SignInHeader from './SignInHeader.vue';

export default {
  components: { SignInHeader },

  props: ['sentEmail'],

  data() {
    return {
      code: '',
      requestInFlight: false,
      error: null,
    };
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      let resp;
      try {
        this.requestInFlight = true;

        resp = await this.$axios.post('validate-sign-in-code', {
          email: this.sentEmail,
          code: this.code,
        });
      } catch (err) {
        this.requestInFlight = false;

        if (err.response?.status === 400 && err.response?.data?.error) {
          this.error = err.response.data.error;
        } else {
          this.$store.commit('showErrorModal');
          throw err;
        }
      }

      const redirect = resp.data.redirect;
      document.location = redirect;
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
