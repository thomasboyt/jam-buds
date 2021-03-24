<template>
  <settings-panel title="newsletter">
    enable to get emailed the jam buds newz blast, our newsletter launching...
    sometime in 2021 at this rate
    <template #panel-control>
      <loading-spinner v-if="$fetchState.pending || $fetchState.error" />
      <toggle-switch
        v-else
        :is-enabled="isSubscribed"
        :disable-interaction="requestInFlight"
        @toggle="handleToggleSubscription"
      />
    </template>
  </settings-panel>
</template>

<script>
import SettingsPanel from './SettingsPanel';
import ToggleSwitch from '../ToggleSwitch';
import LoadingSpinner from '../LoadingSpinner';

export default {
  components: { SettingsPanel, ToggleSwitch, LoadingSpinner },

  async fetch() {
    const resp = await this.$axios({
      url: '/settings/email-subscription',
      method: 'GET',
    });
    this.isSubscribed = resp.data.subscribed;
  },

  data() {
    return {
      isSubscribed: false,
      requestInFlight: false,
    };
  },

  methods: {
    async handleToggleSubscription() {
      this.isSubscribed = !this.isSubscribed;
      this.requestInFlight = true;

      try {
        if (this.isSubscribed) {
          await this.$axios({
            url: '/settings/email-subscription',
            method: 'POST',
          });
        } else {
          await this.$axios({
            url: '/settings/email-subscription',
            method: 'DELETE',
          });
        }
      } catch (err) {
        this.$store.commit('showErrorModal');
        this.isSubscribed = !this.isSubscribed;
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      this.$store.dispatch('setFlashMessage', {
        message: this.isSubscribed
          ? 'Thanks for subscribing!'
          : "You've been unsubscribed from the newsletter.",
        clearMs: 4000,
      });
    },
  },
};
</script>
