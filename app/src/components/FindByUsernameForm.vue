<template>
  <form @submit="onSubmit">
    <div class="form-row">
      <input type="text" v-model="username" placeholder="e.g. thomas" />

      <button class="button" type="submit">
        find
      </button>
    </div>

    <div v-if="noUserError">
      No user found!
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      noUserError: false,
    };
  },

  methods: {
    async onSubmit(evt) {
      this.noUserError = false;

      evt.preventDefault();

      // look up whether username exists... this is silly but works
      // TODO: some day this should look up some resource with less overhead
      try {
        await this.$axios.get(`/playlists/${this.username}`);
      } catch (err) {
        if (err.response.status === 404) {
          this.noUserError = true;
          return;
        }

        this.$store.commit('showErrorModal');
        throw err;
      }

      // if we got here, user exists!
      this.$router.push(`/users/${this.username}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.form-row {
  display: flex;
  align-items: flex-end;
}

input,
button {
  flex: 0 0 auto;
  height: 45px;
  font-family: 'Work Sans', sans-serif;
}

button {
  font-size: 22px;
  background: yellow;
  color: black;
  font-weight: bold;
  width: 100px;
  margin-left: 20px;
}
</style>

