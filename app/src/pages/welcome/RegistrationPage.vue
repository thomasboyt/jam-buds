<template>
  <div>
    <div class="registration-page">
      <h3>pick a name!</h3>

      <form @submit="handleSubmit">
        <input type="text" v-model="name" />

        <button type="submit" class="submit">gogogo</button>
      </form>

      <p v-if="didError" style="color: red">
        Unknown error occurred
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: '',
      didError: false,
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

      const name = this.name;

      let resp;
      try {
        resp = await axios.post('/auth/registration', {
          name,
          token: this.$route.query.t,
        });
      } catch (err) {
        console.log(err);
        this.didError = true;
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
