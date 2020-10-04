<template>
  <main-wrapper>
    <page-header title="settings" />

    <h3>connections</h3>

    <streaming-service-panel />
    <twitter-connect-panel />

    <h3>profile</h3>

    <feed-privacy-panel />
    <nuxt-link class="link-wrapper" to="/settings/color-scheme">
      <settings-panel title="Color scheme" :is-link="true">
        set the color scheme of your profile
      </settings-panel>
    </nuxt-link>

    <h3>notifications</h3>

    <notifications-panel />

    <h3>helpful links</h3>

    <a class="link-wrapper" href="mailto:hello@jambuds.club">
      <settings-panel title="Support" :is-link="true">
        need to change your email or username or delete your account? just shoot
        us a friendly email at <strong>hello@jambuds.club</strong> and we'll get
        you sorted
      </settings-panel>
    </a>

    <nuxt-link class="link-wrapper" to="/about">
      <settings-panel title="About" :is-link="true">
        in case you forgot what this thing you're using right now is (or if you
        want a refresher on the rules of the place)
      </settings-panel>
    </nuxt-link>

    <a href="#" class="link-wrapper" @click="handleSignOut">
      <settings-panel title="Sign out" :is-link="true">
        sign out of jam buds on this device
      </settings-panel>
    </a>
  </main-wrapper>
</template>

<script>
import MainWrapper from '~/components/MainWrapper.vue';
import PageHeader from '~/components/PageHeader.vue';
import SettingsPanel from '../../components/settings/SettingsPanel.vue';
import StreamingServicePanel from '../../components/settings/StreamingServicePanel.vue';
import TwitterConnectPanel from '../../components/settings/TwitterConnectPanel.vue';
import FeedPrivacyPanel from '../../components/settings/FeedPrivacyPanel.vue';
import NotificationsPanel from '../../components/settings/NotificationsPanel.vue';

export default {
  components: {
    MainWrapper,
    PageHeader,
    SettingsPanel,
    StreamingServicePanel,
    TwitterConnectPanel,
    FeedPrivacyPanel,
    NotificationsPanel,
  },

  head() {
    return {
      title: 'settings',
    };
  },

  methods: {
    async handleSignOut(evt) {
      evt.preventDefault();

      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) {
        return;
      }

      await this.$store.dispatch('signOut');

      document.location.href = '/';
    },
  },
};
</script>

<style lang="scss" scoped>
a.link-wrapper {
  display: block;
  text-decoration: none;
}
</style>
