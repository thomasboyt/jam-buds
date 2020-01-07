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

        <settings-button type="submit" :is-saving="requestInFlight">
          continue
        </settings-button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import FieldErrorDisplay from '../../components/FieldErrorDisplay.vue';
import RegistrationNameUrlField from '../../components/RegistrationNameUrlField.vue';
import SettingsButton from '../../components/settings/SettingsButton.vue';

export default {
  components: { FieldErrorDisplay, RegistrationNameUrlField, SettingsButton },

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

      let resp;
      try {
        resp = await axios.post('/auth/registration', {
          token: this.$route.query.t,

          name: this.name,
          showInPublicFeed: this.showInPublicFeed,
          subscribeToNewsletter: this.subscribeToNewsletter,
        });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
          this.errors = err.response.data.errors;
        } else {
          this.$store.commit('showErrorModal');
          throw err;
        }

        this.requestInFlight = false;
        return;
      }

      if (resp.status === 200) {
        document.location = '/welcome/connect';
      }
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
