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

  async fetch() {
    const [followersResp, followingResp] = await Promise.all([
      this.$axios({
        url: `/users/${this.name}/followers`,
        method: 'GET',
      }),
      this.$axios({
        url: `/users/${this.name}/following`,
        method: 'GET',
      }),
    ]);

    this.followers = followersResp.data.users;
    this.following = followingResp.data.users;

    this.$store.commit('addProfiles', [...this.followers, ...this.following]);
  },

  data() {
    return {
      followers: [],
      following: [],
    };
  },

  computed: {
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s buds`;
    },
  },
};
</script>
