<template>
  <div>
    <h3>color schemes</h3>

    <update-color-scheme />

    <h3>privacy</h3>

    <form @submit="handleUpdatePrivacy">
      <label>
        <input type="checkbox" v-model="showInPublicFeed" />
        show your posts in the public feed
      </label>

      <settings-button type="submit">save</settings-button>
    </form>
  </div>
</template>

<script>
import UpdateColorScheme from '../../components/settings/UpdateColorScheme.vue';
import SettingsButton from '../../components/settings/SettingsButton.vue';

export default {
  components: { UpdateColorScheme, SettingsButton },

  data() {
    return {
      showInPublicFeed: this.$store.state.currentUser.showInPublicFeed,
    };
  },

  methods: {
    async handleUpdatePrivacy(e) {
      e.preventDefault();

      const url = this.showInPublicFeed
        ? '/settings/go-public'
        : '/settings/go-private';

      try {
        await this.$axios({
          url,
          method: 'POST',
          data: this.colorScheme,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      }

      this.$store.commit('updateUserPrivacy', {
        showInPublicFeed: this.showInPublicFeed,
      });
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
