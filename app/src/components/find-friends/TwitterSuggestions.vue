<template>
  <div v-if="showTwitterSuggestions">
    <div v-if="$fetchState.pending" class="friends-placeholder">Loading...</div>
    <div v-else-if="$fetchState.error" class="friends-placeholder">
      Error loading friend suggestions.
    </div>
    <template v-else>
      <div v-if="friendSuggestions.length === 0" class="friends-placeholder">
        No suggestions found! Try inviting your Twitter friends to Jam Buds!
      </div>
      <twitter-users-list v-else :users="friendSuggestions" />
    </template>
  </div>
  <div v-else>
    <p>
      You can find your friends on Twitter by connecting your Twitter account to
      Jam Buds!
    </p>

    <twitter-connect-button :redirect="redirect" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TwitterConnectButton from '../settings/TwitterConnectButton';
import TwitterUsersList from './TwitterUsersList';

export default {
  components: {
    TwitterConnectButton,
    TwitterUsersList,
  },

  async fetch() {
    if (this.$accessor.currentUser.user.twitterName) {
      const resp = await this.$axios({
        url: `/friend-suggestions`,
        method: 'GET',
      });

      this.friendSuggestions = resp.data.users;
    }
  },

  data() {
    return {
      friendSuggestions: null,
    };
  },

  computed: {
    ...mapState({
      showTwitterSuggestions: (state) => state.currentUser.user.twitterName,
    }),
    redirect() {
      return this.$route.fullPath;
    },
  },
};
</script>

<style lang="scss" scoped>
.friends-placeholder {
  text-align: center;
}
</style>
