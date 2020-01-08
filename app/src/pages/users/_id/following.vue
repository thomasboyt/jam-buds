<template>
  <div>
    <profile-nav :title="title" />
    <users-list :users="following" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../../components/ProfileNav.vue';
import UsersList from '../../../components/UsersList.vue';

export default {
  components: {
    ProfileNav,
    UsersList,
  },

  head() {
    return {
      title: this.title,
    };
  },

  async fetch({ store, route }) {
    await store.dispatch('loadProfileFollowing', route.params.id);
  },

  computed: {
    ...mapState({
      name: (state) => state.profile.user.name,
      following: (state) => state.profile.following,
    }),
    title() {
      return `${this.name}'s followed users`;
    },
  },
};
</script>
