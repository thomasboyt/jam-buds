<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>find friends</h2>

      <p :style="{ marginBottom: '32px' }">
        jam buds is more fun with more pals! make sure to check out the
        <nuxt-link to="/public-feed">public feed</nuxt-link> too to find
        more folks to follow.
      </p>

      <panel title="find by username">
        <find-by-username-form />
      </panel>

      <panel title="find on twitter">
        <div v-if="showTwitterSuggestions">
          <div v-if="friendSuggestions.length === 0" class="main-placeholder">
            No suggestions found! Try inviting your Twitter friends to Jam Buds!
          </div>
          <twitter-users-list v-else :users="friendSuggestions" />
        </div>
        <div v-else>
          <p>
            You can find your friends on Twitter by connecting your Twitter
            account to Jam Buds!
          </p>

          <twitter-connect-button redirect="/find-friends" />
        </div>
      </panel>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import TwitterUsersList from '../components/TwitterUsersList.vue';
import TwitterConnectButton from '../components/settings/TwitterConnectButton.vue';
import FindByUsernameForm from '../components/FindByUsernameForm.vue';
import Panel from '../components/Panel.vue';

export default {
  components: {
    SidebarWrapper,
    MainWrapper,
    TwitterUsersList,
    TwitterConnectButton,
    FindByUsernameForm,
    Panel,
  },

  metaInfo: {
    title: 'Find Friends',
  },

  async fetch({ store }) {
    if (store.state.currentUser.twitterName) {
      await store.dispatch('loadFriendSuggestions');
    }
  },

  computed: mapState({
    friendSuggestions: (state) => state.currentUser.friendSuggestions,
    showTwitterSuggestions: (state) => state.currentUser.twitterName,
  }),
};
</script>
