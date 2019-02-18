<template>
  <button
    v-if="isFollowing"
    class="follow-toggle -is-following"
    @click="handleUnfollow"
  >
    <span>Unfollow</span>
  </button>

  <button v-else class="follow-toggle" @click="handleFollow">
    <span>+ Follow</span>
  </button>
</template>

<script>
export default {
  props: ['name'],

  computed: {
    isFollowing() {
      return this.$store.getters.isFollowing(this.name);
    },
  },

  methods: {
    handleFollow() {
      this.$store.dispatch('followUser', this.name);
    },

    handleUnfollow() {
      this.$store.dispatch('unfollowUser', this.name);
    },
  },
};
</script>

<style lang="scss" scoped>
.follow-toggle {
  border: 3px var(--theme-border-color) solid;
  padding: 10px 15px;
  width: 130px;

  font-weight: bold;
  font-size: 16px;

  &.-is-following {
    span {
      display: none;
    }

    &:after {
      content: 'Following';
    }

    &:hover:after {
      content: '- Unfollow';
    }
  }
}
</style>
