<template>
  <div>
    <div class="registration-page">
      <h3>pick a name!</h3>

      <form @submit="handleSubmit">
        <input type="text" v-model="name" />

        <button type="submit" class="submit">gogogo</button>
      </form>

      <field-error-display
        :errors="errors"
        name="name"
        :style="{ marginTop: '20px' }"
      />
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

      const name = this.name;

      let resp;
      try {
        resp = await axios.post('/auth/registration', {
          name,
          token: this.$route.query.t,
        });
      } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
          this.errors = err.response.data.errors;
        } else {
          this.$store.commit('showErrorModal');
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
  max-width: 800px;
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

form {
  display: flex;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

input {
  flex: 1 1 auto;
  min-width: 0px;
  padding: 0px 5px;
  margin-right: 5px;
}

.submit {
  flex: 0 0 auto;
  width: 100px;
  padding: 0px;
}

input,
.submit {
  height: 45px;
  font-family: 'Work Sans', sans-serif;
}

input {
  font-size: 22px;
}

.submit {
  font-size: 22px;
  background: yellow;
  color: black;
  font-weight: bold;
}
</style>
