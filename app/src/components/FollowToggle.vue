<template>
  <jb-button
    v-if="isFollowing"
    class="follow-toggle -is-following"
    @click="handleUnfollow"
  >
    <span>Unfollow</span>
  </jb-button>

  <jb-button v-else class="follow-toggle" @click="handleFollow">
    <span>+ Follow</span>
  </jb-button>
</template>

<script>
import JbButton from './lib/JbButton';

export default {
  components: { JbButton },

  props: ['name'],

  computed: {
    isFollowing() {
      return this.$store.getters.isFollowing(this.name);
    },
  },

  methods: {
    async handleFollow() {
      await this.$store.dispatch('followUser', this.name);

      this.$store.dispatch('setFlashMessage', {
        message: `You're now following ${this.name}!`,
        clearMs: 4000,
      });
    },

    async handleUnfollow() {
      await this.$store.dispatch('unfollowUser', this.name);

      this.$store.dispatch('setFlashMessage', {
        message: `You have unfollowed ${this.name}.`,
        clearMs: 4000,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.follow-toggle {
  padding: 8px 15px;
  width: 120px;
  font-weight: 600;

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
