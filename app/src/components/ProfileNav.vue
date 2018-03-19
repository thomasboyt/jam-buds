<template>
  <div class="user-header">
    <div class="user-header-top">
      <h2>
        {{ title }}
      </h2>

      <follow-toggle v-if="showFollowToggle" :name="name"/>
    </div>

    <div class="user-links">
      <router-link :to="`/users/${name}`" exact-active-class="active">
        Posts
      </router-link>
      /
      <router-link :to="`/users/${name}/liked`" active-class="active">
        Liked
      </router-link>
      /
      <router-link :to="`/users/${name}/following`" active-class="active">
        Following
      </router-link>
      /
      <router-link :to="`/users/${name}/followers`" active-class="active">
        Followers
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FollowToggle from './FollowToggle.vue';

export default {
  components: { FollowToggle },

  props: ['title'],

  computed: {
    ...mapState({
      name: (state) => state.profile.user.twitterName,
      showFollowToggle: (state) =>
        state.auth.authenticated &&
        state.profile.user.twitterName !== state.currentUser.name,
    }),
  },
};
</script>
