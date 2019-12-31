<template>
  <div class="user-header">
    <share-landing-banner>
      <router-link :to="`/?signup-ref=${name}`">sign up</router-link> to follow
      what <strong>{{ name }}</strong> is listening to, and share your own jams!
    </share-landing-banner>

    <div class="user-header-top">
      <page-header :title="name" />
      <follow-toggle v-if="showFollowToggle" :name="name" />
    </div>

    <link-tabs :link-prefix="`/users/${name}`" :links="links" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FollowToggle from './FollowToggle.vue';
import LinkTabs from './LinkTabs.vue';
import ShareLandingBanner from './ShareLandingBanner.vue';
import PageHeader from './PageHeader.vue';

export default {
  components: { FollowToggle, LinkTabs, ShareLandingBanner, PageHeader },

  props: ['title'],

  data() {
    return {
      links: [
        {
          to: '',
          label: 'Playlist',
        },
        {
          to: '/liked',
          label: 'Liked',
        },
        {
          to: '/mixtapes',
          label: 'Mixtapes',
        },
        {
          to: '/following',
          label: 'Following',
        },
        {
          to: '/followers',
          label: 'Followers',
        },
      ],
    };
  },

  computed: {
    ...mapState({
      name: (state) => state.profile.user.name,
      authenticated: (state) => state.auth.authenticated,
      showFollowToggle: (state) =>
        state.auth.authenticated &&
        state.profile.user.name !== state.currentUser.name,
    }),
  },
};
</script>

<style lang="scss" scoped>
.user-header {
  margin-bottom: 30px;

  .user-header-top {
    display: flex;
    align-items: start;

    > * {
      flex: 0 0 auto;
    }

    .follow-toggle {
      margin-left: auto;
    }
  }
}
</style>
