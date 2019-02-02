<template>
  <div class="user-header">
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
      showFollowToggle: (state) =>
        state.auth.authenticated &&
        state.profile.user.name !== state.currentUser.name,
    }),
  },
};
</script>
