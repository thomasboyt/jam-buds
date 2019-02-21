<template>
  <form @submit="handleSubmit">
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
    };
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const email = this.email;

      try {
        await axios.post('/auth/sign-in-token', {
          email,
          signupReferral: this.$route.query['signup-ref'],
        });
      } catch (err) {
        console.log(err.response);
        this.error = true;
        return;
      }

      this.didSignIn = true;

      this.$emit('sentMail', email);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/mixins.scss';

form {
  display: flex;
  width: 100%;
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
  @media (max-width: $breakpoint-small) {
    font-size: 16px;
  }
  @media (min-width: $breakpoint-small) {
    font-size: 22px;
  }
}

.submit {
  font-size: 22px;
  background: yellow;
  color: black;
  font-weight: bold;
}
</style>
