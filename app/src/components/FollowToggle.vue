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
import JbButton from '~/components/lib/JbButton';

export default {
  components: { JbButton },

  props: ['name'],

  computed: {
    isFollowing() {
      return this.$accessor.currentUser.isFollowing(this.name);
    },
  },

  methods: {
    async handleFollow() {
      await this.$accessor.currentUser.followUser(this.name);

      this.$accessor.setFlashMessage({
        message: `You're now following ${this.name}!`,
        clearMs: 4000,
      });
    },

    async handleUnfollow() {
      await this.$accessor.currentUser.unfollowUser(this.name);

      this.$accessor.setFlashMessage({
        message: `You have unfollowed ${this.name}.`,
        clearMs: 4000,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
button.follow-toggle {
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
