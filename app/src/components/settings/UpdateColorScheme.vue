<template>
  <div>
    <p>
      set a color scheme for your profile! you can put in any text you want here
      and there's no real validations, so, uh, make sure it looks ok here.
    </p>

    <p>
      need some inspiration? check out
      <a href="https://cloudflare.design/color/"
        >this fancy color picker by cloudflare</a
      >; it enforces accessibility which is neat
    </p>

    <form @submit="handleSubmit">
      <label>
        text color
        <input type="text" v-model.lazy="colorScheme.textColor" />
      </label>
      <label>
        background color
        <input type="text" v-model.lazy="colorScheme.backgroundColor" />
      </label>
      <label>
        <a href="#">link color</a>
        <input type="text" v-model.lazy="colorScheme.linkColor" />
      </label>

      <settings-button class="settings-button" type="submit"
        >save</settings-button
      >
    </form>
  </div>
</template>

<script>
import SettingsButton from './SettingsButton.vue';
export default {
  components: {
    SettingsButton,
  },

  data() {
    // copy color scheme out of store
    const colorScheme = { ...this.$store.state.currentUser.colorScheme };

    return {
      colorScheme,
    };
  },

  methods: {
    async handleSubmit(e) {
      e.preventDefault();

      this.$axios({
        url: '/settings/color-scheme',
        method: 'POST',
        data: this.colorScheme,
      });

      this.$store.commit('updateColorScheme', this.colorScheme);
      // TODO
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  display: block;
}
</style>
