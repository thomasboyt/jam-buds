<template>
  <div>
    <profile-nav :title="title" />
    <user-likes-playlist :user-name="name" />
  </div>
</template>

<script>
import ProfileNav from '~/components/profile/ProfileNav.vue';
import UserLikesPlaylist from '~/components/playlists/UserLikesPlaylist.vue';

export default {
  components: {
    ProfileNav,
    UserLikesPlaylist,
  },

  head() {
    return {
      title: this.title,
    };
  },

  computed: {
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s liked tracks`;
    },
  },
};
</script>
