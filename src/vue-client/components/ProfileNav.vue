<template>
  <div class="user-header">
    <div class="user-header-top">
      <h2>
        {{title}}
      </h2>
    </div>
    <div class="user-links">
      <router-link :to="`/users/${name}`" exact-active-class="active">
        Posts
      </router-link>
      /
      <router-link :to="`/users/${name}/liked`" active-class="active">
        Liked
      </router-link>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex';

export default {
  props: ['title'],

  computed: {
    ...mapState({
      name: (state) => state.profile.user.twitterName,
    }),
  },
};
</script>