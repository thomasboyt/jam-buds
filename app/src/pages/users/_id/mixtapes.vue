<template>
  <div>
    <profile-nav :title="title">
      <template #cta v-if="isCurrentUserPage">
        <create-mixtape-button />
      </template>
    </profile-nav>

    <panel v-if="isCurrentUserPage && draftMixtapes.length">
      <p>You've started on the following draft mixtapes:</p>
      <ul>
        <li v-for="mixtape of draftMixtapes" :key="mixtape.id">
          <nuxt-link :to="`/mixtapes/${mixtape.id}/${mixtape.slug}`">
            {{ mixtape.title }}
          </nuxt-link>
        </li>
      </ul>
    </panel>

    <playlist
      :items="items"
      :items-exhausted="itemsExhausted"
      :loading-next-page="loadingNextPage"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <mixtape-item :timestamp="item.timestamp" :mixtape="item.mixtape" />
      </template>

      <template #placeholder>
        <p>
          This user does not have any mixtapes yet :(
        </p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../../components/ProfileNav.vue';
import Playlist from '../../../components/playlist/Playlist.vue';
import MixtapeItem from '../../../components/playlist/MixtapeItem.vue';
import Panel from '../../../components/Panel.vue';
import CreateMixtapeButton from '../../../components/CreateMixtapeButton.vue';
import with404Handler from '~/util/with404Handler';

export default {
  components: {
    ProfileNav,
    Playlist,
    MixtapeItem,
    Panel,
    CreateMixtapeButton,
  },

  head() {
    return {
      title: this.title,
    };
  },

  async fetch({ store, route, error }) {
    const requests = [store.dispatch('loadProfileMixtapes', route.params.id)];

    if (
      store.state.auth.authenticated &&
      store.state.currentUser.name === route.params.id
    ) {
      requests.push(store.dispatch('loadDraftMixtapes'));
    }

    await with404Handler(error, Promise.all(requests));
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
    items() {
      return this.$store.getters.playlistItems(this.playlistKey);
    },
    itemsExhausted() {
      return this.$store.state.playlists[this.playlistKey].itemsExhausted;
    },
    title() {
      return `${this.name}'s mixtapes`;
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
