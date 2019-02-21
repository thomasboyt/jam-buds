<template>
  <div class="user-header">
    <template v-if="!authenticated">
      <div class="share-banner">
        <div>
          HEY! this is jam buds, a site that lets you share music with your
          pals!
        </div>
        <div>
          <router-link :to="`/?signup-ref=${name}`">sign up</router-link> to
          follow what <strong>{{ name }}</strong> is listening to, and share
          your own jams!
        </div>
      </div>
    </template>

    <div class="user-header-top">
      <h2>
        {{ title }}
      </h2>

      <follow-toggle v-if="showFollowToggle" :name="name" />
    </div>

    <div class="user-links">
      <span v-for="(link, idx) of links" :key="link.to">
        <router-link :to="`/users/${name}${link.to}`">{{
          link.label
        }}</router-link>
        <span v-if="idx !== links.length - 1">/&nbsp;</span>
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FollowToggle from './FollowToggle.vue';

export default {
  components: { FollowToggle },

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
.share-banner {
  font-size: 18px;
  line-height: 24px;
  border: 1px var(--theme-text-color) solid;
  color: var(--theme-text-color);
  box-shadow: 5px 5px 0px var(--theme-text-color);
  padding: 20px 10px;
  border-radius: 4px;
  margin-bottom: 30px;
  text-align: center;
}
</style>
