<template>
  <div>
    <panel title="change email, change username, or delete your account">
      <p>
        i'm currently working on building out these features. for now, email me
        at
        <a href="mailto:hello@jambuds.club">hello@jambuds.club</a> from your
        account's email (<code>{{ email }}</code
        >) and I'll get it taken care of!
      </p>
    </panel>

    <panel title="privacy">
      <form @submit="handleUpdatePrivacy">
        <label>
          <input type="checkbox" v-model="showInPublicFeed" />
          show your posts in the public feed
        </label>

        <settings-button type="submit">save</settings-button>
      </form>
    </panel>

    <panel title="color schemes">
      <update-color-scheme />
    </panel>
  </div>
</template>

<script>
import UpdateColorScheme from '../../components/settings/UpdateColorScheme.vue';
import SettingsButton from '../../components/settings/SettingsButton.vue';
import Panel from '../../components/Panel.vue';

export default {
  components: { UpdateColorScheme, SettingsButton, Panel },

  data() {
    return {
      showInPublicFeed: this.$store.state.currentUser.showInPublicFeed,
      email: this.$store.state.currentUser.email,
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

      this.$store.dispatch('setFlashMessage', {
        message: this.showInPublicFeed
          ? 'Your posts are now on the public feed!'
          : 'Your posts are now hidden from the public feed.',
        clearMs: 4000,
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
