<template>
  <div>
    <profile-nav :title="title" />
    <h3>followers</h3>
    <users-list :users="followers" />
    <h3>following</h3>
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

  fetch() {
    return with404Handler(
      this.$error,
      Promise.all([
        this.$store.dispatch('loadProfileFollowers', this.name),
        this.$store.dispatch('loadProfileFollowing', this.name),
      ])
    );
  },

  computed: {
    ...mapState({
      followers: (state) => state.profile.followers,
      following: (state) => state.profile.following,
    }),
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s buds`;
    },
  },
};
</script>
