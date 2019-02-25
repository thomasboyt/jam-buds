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

    <form @submit="handleSubmit" class="color-form" :style="colorSchemeStyle">
      <label>
        text color
        <color-picker-input v-model="colorScheme.textColor" />
      </label>
      <label>
        background color
        <color-picker-input v-model="colorScheme.backgroundColor" />
      </label>
      <label>
        card background color
        <color-picker-input v-model="colorScheme.cardBackgroundColor" />
      </label>

      <settings-button class="settings-button" type="submit"
        >save</settings-button
      >
    </form>
  </div>
</template>

<script>
import SettingsButton from './SettingsButton.vue';
import ColorPickerInput from '../ColorPickerInput.vue';
import getCSSVariablesFromColorScheme from '../../util/getCSSVariablesFromColorScheme';

export default {
  components: {
    SettingsButton,
    ColorPickerInput,
  },

  data() {
    // copy color scheme out of store
    const colorScheme = { ...this.$store.state.currentUser.colorScheme };

    return {
      colorScheme,
    };
  },

  computed: {
    colorSchemeStyle() {
      return getCSSVariablesFromColorScheme(this.colorScheme);
    },
  },

  methods: {
    async handleSubmit(e) {
      e.preventDefault();

      try {
        this.$axios({
          url: '/settings/color-scheme',
          method: 'POST',
          data: this.colorScheme,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }

      this.$store.commit('updateColorScheme', { ...this.colorScheme });
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  display: block;
}

.color-form {
  background-color: var(--theme-body-background-color);
  color: var(--theme-text-color);
}
</style>
