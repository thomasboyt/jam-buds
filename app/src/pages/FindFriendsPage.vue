<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>Find Friends</h2>

      <div v-if="showTwitterSuggestions">
        <div v-if="friendSuggestions.length === 0" class="main-placeholder">
          No suggestions found! Try inviting your Twitter friends to Jam Buds!
        </div>
        <twitter-users-list v-else :users="friendSuggestions" />
      </div>
      <div v-else class="main-placeholder">
        <p>
          You can find your friends on Twitter by connecting your Twitter
          account to Jam Buds!
        </p>

        <twitter-connect-button redirect="/find-friends" />
      </div>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import TwitterUsersList from '../components/TwitterUsersList.vue';
import TwitterConnectButton from '../components/settings/TwitterConnectButton.vue';

export default {
  components: {
    SidebarWrapper,
    MainWrapper,
    TwitterUsersList,
    TwitterConnectButton,
  },

  metaInfo: {
    title: 'Find Friends',
  },

  async asyncData({ store }) {
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
