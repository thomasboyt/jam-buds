<template>
  <sidebar-wrapper>
    <main-wrapper>
      <h2>Find Friends</h2>

      <div v-if="showTwitterSuggestions">
        <div v-if="friendSuggestions.length === 0" class="main-placeholder">
          No suggestions found! Try inviting your Twitter friends to Jam Buds!
        </div>
        <users-list v-else :users="friendSuggestions" />
      </div>
      <div v-else>
        TODO: Add connect Twitter link here...
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
    if (store.state.currentUser.hasTwitter) {
      await store.dispatch('loadFriendSuggestions');
    }

    console.log('hi');
  },

  computed: mapState({
    friendSuggestions: (state) => state.currentUser.friendSuggestions,
    showTwitterSuggestions: (state) => state.currentUser.hasTwitter,
  }),
};
</script>
