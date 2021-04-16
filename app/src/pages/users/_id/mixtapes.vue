<template>
  <div>
    <profile-nav :title="title" />
    <panel v-if="showDraftMixtapes">
      <draft-mixtapes-list :mixtapes="draftMixtapes" />
    </panel>

    <user-mixtapes-playlist
      :user-name="name"
      :initial-fetch-state="$fetchState"
    />
  </div>
</template>

<script>
import ProfileNav from '~/components/profile/ProfileNav.vue';
import DraftMixtapesList from '~/components/DraftMixtapesList.vue';
import UserMixtapesPlaylist from '~/components/playlists/UserMixtapesPlaylist.vue';
import Panel from '~/components/Panel.vue';

export default {
  components: {
    ProfileNav,
    DraftMixtapesList,
    UserMixtapesPlaylist,
    Panel,
  },

  head() {
    return {
      title: this.title,
    };
  },

  fetch() {
    const requests = [
      this.$store.dispatch(
        'playlist/loadProfileMixtapes',
        this.$route.params.id
      ),
    ];

    if (
      this.$accessor.auth.authenticated &&
      this.$accessor.currentUser.user.name === this.$route.params.id
    ) {
      requests.push(this.$store.dispatch('mixtapes/loadDraftMixtapes'));
    }

    return Promise.all(requests);
  },

  computed: {
    draftMixtapes() {
      return this.$accessor.mixtapes.draftMixtapes;
    },
    isCurrentUserPage() {
      return (
        this.$accessor.auth.authenticated &&
        this.$accessor.currentUser.user.name === this.name
      );
    },
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s mixtapes`;
    },
    showDraftMixtapes() {
      return (
        this.isCurrentUserPage &&
        !this.$fetchState.pending &&
        !this.$fetchState.error &&
        this.draftMixtapes.length
      );
    },
  },
};
</script>
