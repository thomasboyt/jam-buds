<template>
  <div>
    <profile-nav :title="title" />

    <div class="header-row">
      <h3>following</h3>

      <div class="button-container" v-if="isCurrentUser">
        <nuxt-link
          class="find-friends-button"
          :to="{ query: { modal: 'find-friends' } }"
        >
          + Follow
        </nuxt-link>
      </div>
    </div>

    <users-list :users="following" />

    <div class="header-row">
      <h3>followers</h3>
    </div>
    <users-list :users="followers" />

    <find-friends-modal v-if="isCurrentUser" />
  </div>
</template>

<script>
import ProfileNav from '~/components/profile/ProfileNav.vue';
import UsersList from '~/components/profile/UsersList.vue';
import FindFriendsModal from '~/components/find-friends/FindFriendsModal';

export default {
  components: {
    ProfileNav,
    UsersList,
    FindFriendsModal,
  },

  head() {
    return {
      title: this.title,
    };
  },

  async fetch() {
    const [followersResp, followingResp] = await Promise.all([
      this.$axios({
        url: `/users/${this.name}/followers`,
        method: 'GET',
      }),
      this.$axios({
        url: `/users/${this.name}/following`,
        method: 'GET',
      }),
    ]);

    this.followers = followersResp.data.users;
    this.following = followingResp.data.users;

    this.$accessor.profile.addProfiles([...this.followers, ...this.following]);
  },

  data() {
    return {
      followers: [],
      following: [],
    };
  },

  computed: {
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s buds`;
    },
    isCurrentUser() {
      return this.name === this.$accessor.currentUser.user?.name;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/styles/mixins.scss';

.header-row {
  display: flex;
  align-items: center;
  margin: $spacing-lg 0;

  h3 {
    @include heading-md();
    margin: 0;
  }

  .button-container {
    margin-left: auto;
  }
}

.find-friends-button {
  color: var(--theme-text-color);
  // this is a weird color because darker colors have aliasing problems
  border: 1px #444 solid;
  border-radius: 9999px;
  text-decoration: none;

  padding: 6px 20px;
  width: 110px;
}
</style>
