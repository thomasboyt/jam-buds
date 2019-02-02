<template>
  <div>
    <profile-nav :title="title" />
    <users-list :users="followers" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../components/ProfileNav.vue';
import UsersList from '../../components/UsersList.vue';
import titleMixin from '../../util/titleMixin';

export default {
  components: {
    ProfileNav,
    UsersList,
  },

  mixins: [titleMixin],

  title() {
    return this.title;
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadProfileFollowers', route.params.id);
  },

  computed: {
    ...mapState({
      name: (state) => state.profile.user.name,
      followers: (state) => state.profile.followers,
    }),
    title() {
      return `@${this.name}'s followers`;
    },
  },
};
</script>
