<template>
  <div>
    <profile-nav :title="`@${name}'s followers`"></profile-nav>
    <users-list :users="followers"></users-list>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import ProfileNav from '../../components/ProfileNav.vue';
  import UsersList from '../../components/UsersList.vue';

  export default {
    async asyncData({store, route}) {
      await store.dispatch('loadProfileFollowers', route.params.id);
    },

    computed: {
      ...mapState({
        name: (state) => state.profile.user.twitterName,
        followers: (state) => state.profile.followers,
      }),
    },

    components: {
      ProfileNav,
      UsersList,
    },
  };
</script>