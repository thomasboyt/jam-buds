<template>
  <div>
    <profile-nav :title="`@${name}'s followed users`"/>
    <users-list :users="following"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../components/ProfileNav.vue';
import UsersList from '../../components/UsersList.vue';

export default {
  async asyncData({ store, route }) {
    await store.dispatch('loadProfileFollowing', route.params.id);
  },

  computed: {
    ...mapState({
      name: (state) => state.profile.user.twitterName,
      following: (state) => state.profile.following,
    }),
  },

  components: {
    ProfileNav,
    UsersList,
  },
};
</script>
