<template>
  <div class="user-header">
    <share-landing-banner>
      <nuxt-link :to="`/?signup-ref=${name}`">sign up</nuxt-link> to follow what
      <strong>{{ name }}</strong> is listening to, and share your own jams!
    </share-landing-banner>

    <page-header :title="name">
      <template #cta>
        <slot name="cta">
          <follow-toggle v-if="showFollowToggle" :name="name" />
        </slot>
      </template>
    </page-header>

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
          to: '/buds',
          label: 'Buds',
        },
      ],
    };
  },

  computed: {
    ...mapState({
      authenticated: (state) => state.auth.authenticated,
      showFollowToggle(state) {
        return state.auth.authenticated && state.currentUser.name !== this.name;
      },
    }),
    name() {
      return this.$route.params.id;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.user-header {
  margin-bottom: 16px;
}
</style>
