<template>
  <sidebar-wrapper>
    <main-wrapper>
      <h2>Find Friends</h2>

      <div v-if="friendSuggestions.length === 0" class="main-placeholder">
        No suggestions found! Try inviting your Twitter friends to Jam Buds!
      </div>

      <users-list v-else :users="friendSuggestions"></users-list>
    </main-wrapper>
  </sidebar-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import MainWrapper from '../components/MainWrapper.vue';
import SidebarWrapper from '../components/SidebarWrapper.vue';
import UsersList from '../components/UsersList.vue';

export default {
  components: { SidebarWrapper, MainWrapper, UsersList },

  async asyncData({ store, route }) {
    await store.dispatch('loadFriendSuggestions');
  },

  computed: mapState({
    friendSuggestions: (state) => state.currentUser.friendSuggestions,
  }),
};
</script>
