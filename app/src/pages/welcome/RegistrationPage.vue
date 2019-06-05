<template>
  <div>
    <div class="registration-page">
      <p>we're glad to have you!</p>

      <form @submit="handleSubmit">
        <label>
          <div class="label-text">your name</div>
          <input type="text" v-model="name" />
        </label>

        <label>
          <input type="checkbox" v-model="showInPublicFeed" />
          show your posts in the public feed
        </label>

        <field-error-display
          :errors="errors"
          name="name"
          :style="{ marginTop: '20px' }"
        />

        <button type="submit" class="submit">gogogo</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import FieldErrorDisplay from '../../components/FieldErrorDisplay.vue';

export default {
  components: { FieldErrorDisplay },

  data() {
    return {
      name: '',
      showInPublicFeed: false,
      didError: false,
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

      let resp;
      try {
        resp = await axios.post('/auth/registration', {
          name: this.name,
          showInPublicFeed: this.showInPublicFeed,
          token: this.$route.query.t,
        });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
          this.errors = err.response.data.errors;
        } else {
          this.$store.commit('showErrorModal');
          throw err;
        }

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
  max-width: 400px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;
}

h3 {
  font-size: 32px;
  line-height: 1em;
  margin-bottom: 24px;
  font-weight: normal;
}

label {
  display: block;
  margin-bottom: 20px;
  text-align: left;
}

.label-text {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.submit {
  flex: 0 0 auto;
  width: 100px;
  padding: 0px;
}

input:not([type='checkbox']),
.submit {
  height: 45px;
  font-family: 'Work Sans', sans-serif;
}

input:not([type='checkbox']) {
  font-size: 22px;
  padding: 0px 5px;
  width: 100%;
}

.submit {
  margin-top: 20px;
  font-size: 22px;
  background: yellow;
  color: black;
  font-weight: bold;
}
</style>
