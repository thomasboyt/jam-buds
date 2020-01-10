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
import with404Handler from '~/util/with404Handler';

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

  async fetch({ store, route, error }) {
    await with404Handler(
      error,
      store.dispatch('loadProfileFollowing', route.params.id)
    );
  },

  computed: {
    ...mapState({
      following: (state) => state.profile.following,
    }),
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s followed users`;
    },
  },
};
</script>
