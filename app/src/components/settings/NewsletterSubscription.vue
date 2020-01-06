<template>
  <div>
    <p>
      the jam buds newz blast is a weeklyish newsletter about what's new, what's
      coming, and probably some words about music that i like and want to talk
      about. you can check it out at
      <a href="https://newz.jambuds.club/">newz.jambuds.club</a>.
    </p>

    <form @submit="handleUpdateNewsletter" v-if="loaded">
      <label>
        <input
          type="checkbox"
          v-model="newsletterSubscribed"
          :disabled="requestInFlight"
        />
        email me jam buds newz blasts
      </label>

      <settings-button type="submit" :is-saving="requestInFlight"
        >save</settings-button
      >
    </form>
    <div v-else>
      <em>(loading...)</em>
    </div>
  </div>
</template>

<script>
import SettingsButton from './SettingsButton.vue';

export default {
  components: { SettingsButton },

  data() {
    return {
      loaded: false,
      newsletterSubscribed: false,
      requestInFlight: false,
    };
  },

  // TODO: yes it's silly this doesn't use asyncData
  mounted() {
    this.getSubscriptionState();
  },

  methods: {
    async getSubscriptionState() {
      const resp = await this.$axios({
        url: '/settings/email-subscription',
        method: 'GET',
      });
      this.loaded = true;
      this.newsletterSubscribed = resp.data.subscribed;
    },

    async handleUpdateNewsletter(e) {
      e.preventDefault();

      this.requestInFlight = true;

      try {
        if (this.newsletterSubscribed) {
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
        throw err;
      } finally {
        this.requestInFlight = false;
      }

      this.$store.dispatch('setFlashMessage', {
        message: this.newsletterSubscribed
          ? 'Thanks for subscribing!'
          : "You've been unsubscribed from the newsletter.",
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
