<template>
  <div>
    <div class="registration-page">
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
    </div>
  </div>
</template>

<script>
import FieldErrorDisplay from '~/components/FieldErrorDisplay.vue';
import RegistrationNameUrlField from '~/components/RegistrationNameUrlField.vue';
import JbButton from '~/components/lib/JbButton.vue';

export default {
  components: { FieldErrorDisplay, RegistrationNameUrlField, JbButton },

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
    if (this.$store.state.auth.authenticated) {
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
          this.$store.commit('showErrorModal');
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
.registration-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;
}

form {
  margin-top: 24px;
}

.check-options {
  max-width: 420px;
  margin: 20px auto 50px;

  label {
    display: block;
    margin-bottom: 10px;
    text-align: left;
  }
}

.submit {
  flex: 0 0 auto;
  width: 100px;
  padding: 10px 5px;
  margin-top: 20px;
  font-size: 22px;
  background: yellow;
  color: black;
  font-weight: bold;
}
</style>
