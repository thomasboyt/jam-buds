<template>
  <div>
    <profile-nav :title="title">
      <template #cta v-if="isCurrentUserPage">
        <create-mixtape-button />
      </template>
    </profile-nav>

    <draft-mixtapes-list v-if="showDraftMixtapes" :mixtapes="draftMixtapes" />

    <user-mixtapes-playlist
      :user-name="name"
      :initial-fetch-state="$fetchState"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ProfileNav from '~/components/profile/ProfileNav.vue';
import DraftMixtapesList from '~/components/profile/DraftMixtapesList.vue';
import CreateMixtapeButton from '~/components/profile/CreateMixtapeButton.vue';
import UserMixtapesPlaylist from '~/components/playlists/UserMixtapesPlaylist.vue';

export default {
  components: {
    ProfileNav,
    DraftMixtapesList,
    CreateMixtapeButton,
    UserMixtapesPlaylist,
  },

  head() {
    return {
      title: this.title,
    };
  },

  fetch() {
    const requests = [
      this.$store.dispatch('loadProfileMixtapes', this.$route.params.id),
    ];

    if (
      this.$store.state.auth.authenticated &&
      this.$store.state.currentUser.name === this.$route.params.id
    ) {
      requests.push(this.$store.dispatch('loadDraftMixtapes'));
    }

    return Promise.all(requests);
  },

  computed: {
    ...mapState({
      draftMixtapes: (state) => state.currentUser.draftMixtapes,
      isCurrentUserPage(state) {
        return state.auth.authenticated && state.currentUser.name === this.name;
      },
    }),
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
