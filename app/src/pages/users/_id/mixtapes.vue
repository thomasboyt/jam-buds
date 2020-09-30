<template>
  <div>
    <profile-nav :title="title">
      <template #cta v-if="isCurrentUserPage">
        <create-mixtape-button />
      </template>
    </profile-nav>

    <draft-mixtapes-list v-if="showDraftMixtapes" :mixtapes="draftMixtapes" />

    <playlist
      :playlist-key="playlistKey"
      :loading-next-page="loadingNextPage"
      :error="$fetchState.error"
      :is-loading="$fetchState.pending"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <mixtape-item :timestamp="item.timestamp" :mixtape="item.mixtape" />
        <entry-details
          type="userPlaylist"
          :id="item.postId"
          :name="name"
          :note="item.noteText"
          :date="item.timestamp"
        />
      </template>

      <template #placeholder>
        <p>This user does not have any mixtapes yet :(</p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../../components/ProfileNav.vue';
import Playlist from '../../../components/playlist/Playlist.vue';
import MixtapeItem from '../../../components/playlist/MixtapeItem.vue';
import EntryDetails from '../../../components/playlist/EntryDetails.vue';
import DraftMixtapesList from '../../../components/DraftMixtapesList.vue';
import CreateMixtapeButton from '../../../components/CreateMixtapeButton.vue';

export default {
  components: {
    ProfileNav,
    Playlist,
    MixtapeItem,
    DraftMixtapesList,
    CreateMixtapeButton,
    EntryDetails,
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

  data() {
    return {
      loadingNextPage: false,
    };
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
    playlistKey() {
      return `${this.name}/mixtapes`;
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

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadNextPlaylistPage', {
          key: this.playlistKey,
        });
      } catch (err) {
        this.$store.commit('showErrorModal');
        throw err;
      } finally {
        this.loadingNextPage = false;
      }
    },
  },
};
</script>
