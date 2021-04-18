<template>
  <div>
    <sign-in-header>enter sign-in code</sign-in-header>

    <p class="label">
      Check your inbox at
      <strong>{{ sentEmail }}</strong>
      for a 6-digit code.
    </p>

    <form @submit="handleSubmit">
      <div class="field-group">
        <input
          type="text"
          v-model="code"
          placeholder="enter code..."
          aria-label="Code"
        />

        <field-error-display
          name="code"
          :errors="errors"
          class="field-errors"
        />
      </div>

      <jb-button
        button-style="page-action full-width"
        type="submit"
        :disabled="requestInFlight"
      >
        next
      </jb-button>
    </form>

    <p class="email-note">
      please allow up to 5 minutes for the email to arrive. due to strange
      forces of computers outside of our control, sometimes our emails may go to
      your "spam" folder, or, in Gmail, the "Promotions" tab.
    </p>
  </div>
</template>

<script>
import SignInHeader from './SignInHeader.vue';
import FieldErrorDisplay from '../FieldErrorDisplay.vue';
import JbButton from '../lib/JbButton.vue';

export default {
  components: { SignInHeader, FieldErrorDisplay, JbButton },

  props: ['sentEmail'],

  data() {
    return {
      code: '',
      requestInFlight: false,
      errors: null,
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

        if (err.response?.status === 400 && err.response?.data?.details) {
          this.errors = err.response.data.details[0];
          return;
        } else {
          this.$accessor.showErrorModal();
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
  height: $spacing-3xl;

  @media (max-width: $breakpoint-small) {
    font-size: $text-base;
  }
  @media (min-width: $breakpoint-small) {
    font-size: $text-lg;
  }
}

.field-group {
  margin-bottom: $spacing-lg;
}

.field-errors {
  margin-top: $spacing-md;
}

.email-note {
  font-size: $text-xs;
  margin-top: $spacing-sm;
}
</style>
