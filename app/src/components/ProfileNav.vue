<template>
  <div class="user-header">
    <share-landing-banner>
      <nuxt-link :to="`/?signup-ref=${name}`">sign up</nuxt-link> to follow what
      <strong>{{ name }}</strong> is listening to, and share your own jams!
    </share-landing-banner>

    <div class="user-header-top">
      <page-header :title="name" />
      <div class="cta-container">
        <slot name="cta">
          <follow-toggle v-if="showFollowToggle" :name="name" />
        </slot>
      </div>
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
  h2 {
    margin-bottom: 0px;
  }

  margin-bottom: 16px;

  .user-header-top {
    display: flex;
    align-items: center; // vertical align
    margin-bottom: 16px;

    > * {
      flex: 0 0 auto;
    }

    .cta-container {
      margin-left: auto;
    }
  }

  @media (min-width: $breakpoint-small) {
    .user-header-top {
      margin-bottom: 32px;
    }
  }
}
</style>
