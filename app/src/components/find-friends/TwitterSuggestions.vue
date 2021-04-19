<template>
  <div v-if="showTwitterSuggestions">
    <div v-if="$fetchState.pending" class="friends-placeholder">Loading...</div>
    <div v-else-if="$fetchState.error" class="friends-placeholder">
      Error loading friend suggestions.
    </div>
    <template v-else>
      <div
        v-if="!friendSuggestions || friendSuggestions.length === 0"
        class="friends-placeholder"
      >
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

<script lang="ts">
import Vue from 'vue';
import { ApiSchema } from '~/api/_helpers';
import TwitterConnectButton from '../settings/TwitterConnectButton.vue';
import TwitterUsersList from './TwitterUsersList.vue';

export default Vue.extend({
  components: {
    TwitterConnectButton,
    TwitterUsersList,
  },

  async fetch(): Promise<void> {
    if (this.$accessor.currentUser.user!.twitterName) {
      const resp = await this.$axios({
        url: `/friend-suggestions`,
        method: 'GET',
      });

      const data = resp.data as ApiSchema<'TwitterFriendSuggestionsResponse'>;

      this.friendSuggestions = data.users;
    }
  },

  data() {
    return {
      friendSuggestions: null as ApiSchema<'TwitterFriendSuggestion'>[] | null,
    };
  },

  computed: {
    showTwitterSuggestions(): boolean {
      return !!this.$accessor.currentUser.user!.twitterName;
    },
    redirect(): string {
      return this.$route.fullPath;
    },
  },
});
</script>

<style lang="scss" scoped>
.friends-placeholder {
  text-align: center;
}
</style>
