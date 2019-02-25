<template>
  <sidebar-wrapper v-slot="{ withSidebar }">
    <main-wrapper :with-sidebar="withSidebar">
      <h2>Find Friends</h2>

      <div v-if="showTwitterSuggestions">
        <div v-if="friendSuggestions.length === 0" class="main-placeholder">
          No suggestions found! Try inviting your Twitter friends to Jam Buds!
        </div>
        <users-list v-else :users="friendSuggestions" />
      </div>
      <div v-else class="main-placeholder">
        You can find your friends on Twitter by
        <router-link to="/settings"
          >connecting your Twitter account to Jam Buds!</router-link
        >
      </div>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import UsersList from '../components/UsersList.vue';
import titleMixin from '../util/titleMixin';

export default {
  components: { SidebarWrapper, MainWrapper, UsersList },

  mixins: [titleMixin],

  title: 'Find Friends',

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
