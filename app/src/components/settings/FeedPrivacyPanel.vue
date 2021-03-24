<template>
  <settings-panel title="Show on public feed">
    you
    <strong>
      <template v-if="showInPublicFeed">will</template>
      <template v-else>will not</template>
    </strong>
    appear in the public feed
    <template #panel-control>
      <toggle-switch
        :is-enabled="showInPublicFeed"
        @toggle="handleUpdatePrivacy"
      />
    </template>
  </settings-panel>
</template>

<script>
import ToggleSwitch from '~/components/ToggleSwitch';
import SettingsPanel from './SettingsPanel.vue';

export default {
  components: { ToggleSwitch, SettingsPanel },

  computed: {
    showInPublicFeed() {
      return this.$store.state.currentUser.showInPublicFeed;
    },
  },

  methods: {
    async handleUpdatePrivacy() {
      // optimistic update
      this.$store.commit('updateUserPrivacy', {
        showInPublicFeed: !this.showInPublicFeed,
      });

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
        // de...optimistic update
        this.$store.commit('updateUserPrivacy', {
          showInPublicFeed: !this.showInPublicFeed,
        });
        throw err;
      }
    },
  },
};
</script>
