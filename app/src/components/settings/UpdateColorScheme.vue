<template>
  <div>
    <p>
      set a background gradient for your profile!
    </p>

    <form @submit="handleSubmit">
      <label>
        <div class="field-label">
          background gradient
        </div>
        <div class="field-control">
          <select v-model="colorScheme.backgroundGradientName">
            <option
              v-for="gradientName of gradients"
              :key="gradientName"
              :value="gradientName"
              >{{ gradientName }}</option
            >
          </select>
        </div>
      </label>
      <settings-button type="submit" :style="{ marginTop: '10px' }"
        >save</settings-button
      >
    </form>
  </div>
</template>

<script>
import SettingsButton from './SettingsButton.vue';
import { gradients, defaultColorScheme } from '../../util/gradients';

export default {
  components: {
    SettingsButton,
  },

  data() {
    const gradientNames = Object.keys(gradients);

    // copy color scheme out of store
    const colorScheme = {
      ...defaultColorScheme,
      ...this.$store.state.currentUser.colorScheme,
    };

    return {
      colorScheme,
      gradients: gradientNames,
    };
  },

  methods: {
    async handleSubmit(e) {
      e.preventDefault();

      try {
        await this.$axios({
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
  margin-bottom: 10px;
}
</style>
