<template>
  <form @submit="handleSubmit">
    <input
      type="email"
      v-model="email"
      placeholder="enter ur email..."
      aria-label="Email"
    />

    <button type="submit" class="submit" :disabled="requestInFlight">
      let's go!
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      requestInFlight: false,
    };
  },

  methods: {
    async handleSubmit(evt) {
      evt.preventDefault();

      const email = this.email;

      let resp;
      try {
        this.requestInFlight = true;

        resp = await this.$axios.post('sign-in-token', {
          email,
          signupReferral: this.$route.query['signup-ref'],
        });
      } catch (err) {
        this.requestInFlight = false;

        this.$store.commit('showErrorModal');
        throw err;
      }

      this.didSignIn = true;

      this.$emit('sentMail', email);

      if (this.$config.DANGER_SKIP_AUTH) {
        if (resp.data.isRegistration) {
          document.location = `/welcome/registration?t=${resp.data.token}`;
        } else {
          document.location = `/auth/sign-in?t=${resp.data.token}`;
        }
      }
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
