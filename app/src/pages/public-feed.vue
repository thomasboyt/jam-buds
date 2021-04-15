<template>
  <main-wrapper>
    <page-header title="public feed" />
    <p>
      this page will probably be replaced by some kind of fancy "top posts"
      aggregator once we have, like, actual users. for now, please use it to
      find folks you'd like to follow, or just see what people are into outside
      of your sphere.
    </p>

    <p v-if="authenticated">
      you have public posts
      <strong>{{ publicPostsStatus }}</strong> and will
      <span v-if="!enabledPublicPosts">not</span> show up in this feed. you can
      change that <nuxt-link to="/settings">here</nuxt-link> if you'd like.
    </p>

    <public-feed />
  </main-wrapper>
</template>

<script>
import { mapState } from 'vuex';

import MainWrapper from '~/components/MainWrapper.vue';
import PageHeader from '~/components/PageHeader.vue';
import PublicFeed from '~/components/playlists/PublicFeed.vue';

export default {
  components: {
    MainWrapper,
    PageHeader,
    PublicFeed,
  },

  head() {
    return {
      title: 'Public Feed',
    };
  },

  computed: {
    ...mapState({
      authenticated: (state) => state.auth.authenticated,
      enabledPublicPosts: (state) => state.currentUser.user?.showInPublicFeed,
    }),

    publicPostsStatus() {
      return this.enabledPublicPosts ? 'enabled' : 'disabled';
    },
  },
};
</script>
