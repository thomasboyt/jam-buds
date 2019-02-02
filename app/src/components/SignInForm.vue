<template>
  <div v-if="didSignIn">
    <h3 style="color: hotpink">🎉 Email Sent! 🎉</h3>
    <p>
      Check your inbox at
      <br />
      <strong>{{ this.email }}</strong>
      <br />for a link to sign in or sign up.
    </p>
  </div>
  <form v-else @submit="handleSubmit">
    <input
      type="email"
      v-model="email"
      placeholder="enter ur email..."
      aria-label="Email"
    />

    <button type="submit" class="submit">let's go!</button>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      didSignIn: false,
    };
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const email = this.email;

      try {
        await axios.post(`${process.env.API_URL}/auth/sign-in-token`, {
          email,
        });
      } catch (err) {
        console.log(err.response);
        this.error = true;
        return;
      }

      this.didSignIn = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.submit {
  background: yellow;
  color: black;
  font-weight: bold;
  padding: 3px 5px;
}
</style>
