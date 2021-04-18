<template>
  <div>
    <welcome-step-panel>
      <form @submit="handleSubmit">
        <registration-name-url-field v-model="name" />

        <field-error-display
          name="name"
          :errors="errors"
          :style="{ marginBottom: '20px' }"
        />

        <div class="check-options">
          <label>
            <input type="checkbox" v-model="showInPublicFeed" />
            show your posts in the public feed
          </label>

          <label>
            <input type="checkbox" v-model="subscribeToNewsletter" />
            subscribe to the weekly-ish jam buds newsletter
          </label>
        </div>

        <jb-button type="submit" :disabled="requestInFlight">
          continue
        </jb-button>
      </form>
    </welcome-step-panel>
  </div>
</template>

<script>
import FieldErrorDisplay from '~/components/FieldErrorDisplay.vue';
import RegistrationNameUrlField from '~/components/RegistrationNameUrlField.vue';
import JbButton from '~/components/lib/JbButton.vue';
import WelcomeStepPanel from '~/components/WelcomeStepPanel';

export default {
  components: {
    FieldErrorDisplay,
    RegistrationNameUrlField,
    JbButton,
    WelcomeStepPanel,
  },

  data() {
    return {
      name: '',
      showInPublicFeed: false,
      subscribeToNewsletter: false,
      didError: false,
      requestInFlight: false,
      errors: null,
    };
  },

  created() {
    if (this.$accessor.auth.authenticated) {
      this.$router.push('/welcome/connect');
    }
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      this.errors = null;
      this.didError = false;
      this.requestInFlight = true;

      try {
        await this.$axios.post('registration', {
          token: this.$route.query.t,
          name: this.name,
          showInPublicFeed: this.showInPublicFeed,
          subscribeToNewsletter: this.subscribeToNewsletter,
          referral: this.$route.query.referral,
        });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.details) {
          this.errors = err.response.data.details[0];
        } else {
          this.$accessor.showErrorModal();
          throw err;
        }

        this.requestInFlight = false;
        return;
      }

      document.location = '/welcome/connect';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

form {
  margin-top: $spacing-lg;
}

.check-options {
  max-width: 420px;
  margin: $spacing-lg auto $spacing-3xl;

  label {
    display: block;
    margin-bottom: $spacing-xs;
    text-align: left;
  }
}
</style>
