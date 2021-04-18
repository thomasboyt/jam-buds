<template>
  <main-wrapper>
    <page-header title="update color scheme" />

    <p>set a background gradient for your profile!</p>

    <ul>
      <li class="checkbox-option" v-for="gradient of gradients" :key="gradient">
        <label>
          <div class="label-content">{{ gradient }}</div>
          <input
            type="radio"
            name="color-scheme"
            :checked="gradient === colorScheme.backgroundGradientName"
            @change="handleChangeColorScheme(gradient)"
          />
        </label>
      </li>
    </ul>
  </main-wrapper>
</template>

<script>
import MainWrapper from '~/components/MainWrapper.vue';
import PageHeader from '~/components/PageHeader.vue';
import { gradients, defaultColorScheme } from '../../util/gradients';

export default {
  components: {
    MainWrapper,
    PageHeader,
  },

  head() {
    return {
      title: 'update color scheme',
    };
  },

  data() {
    const gradientNames = Object.keys(gradients);

    // copy color scheme out of store
    const colorScheme = {
      ...defaultColorScheme,
      ...this.$accessor.profile.currentUserColorScheme,
    };

    return {
      colorScheme,
      gradients: gradientNames,
    };
  },

  methods: {
    async handleChangeColorScheme(gradient) {
      const colorScheme = {
        backgroundGradientName: gradient,
        textColor: 'black',
      };
      const prevScheme = { ...this.colorScheme };
      this.colorScheme = colorScheme;

      this.$accessor.profile.updateProfileColorScheme({
        name: this.$accessor.currentUser.user.name,
        colorScheme,
      });

      try {
        await this.$axios({
          url: '/settings/color-scheme',
          method: 'POST',
          data: {
            backgroundGradientName: gradient,
            textColor: 'black',
          },
        });
      } catch (err) {
        this.$accessor.showErrorModal();
        this.colorScheme = prevScheme;
        throw err;
      }

      this.$accessor.setFlashMessage({
        message: 'Your color scheme has been updated.',
        clearMs: 4000,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.checkbox-option {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  margin-bottom: $spacing-sm;

  label {
    padding: $spacing-sm;
    display: flex;

    .label-content {
      flex: 0 0 auto;
    }
    input {
      flex: 0 0 auto;
      margin-left: auto;
    }
  }
}
</style>
