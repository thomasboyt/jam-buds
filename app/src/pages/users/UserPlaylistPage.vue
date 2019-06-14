<template>
  <div>
    <profile-nav :title="title" />
    <playlist
      entry-type="playlist-entry"
      :entries="entries"
      :entries-exhausted="entriesExhausted"
      :loading-next-page="loadingNextPage"
      :playback-source-label="title"
      :playback-source-path="playbackSourcePath"
      @requestNextPage="handleRequestNextPage"
    >
      <p slot="placeholder">
        This user has not posted any songs yet :(
      </p>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../components/ProfileNav.vue';
import Playlist from '../../components/playlist/Playlist.vue';

export default {
  components: {
    ProfileNav,
    Playlist,
  },

  metaInfo() {
    let meta = {
      title: `${this.name}'s playlist`,
      description: 'check out this playlist on jam buds!',
      image: `${process.env.STATIC_URL}/corgi_icon_square.png`,
    };

    if (this.$route.query.song) {
      const song = this.$store.state.songs[this.$route.query.song];
      if (song) {
        meta = {
          title: song.title,
          description: `${this.name} posted ${song.title} by ${
            song.artists[0]
          } on Jam Buds!`,
          image: song.albumArt,
        };
      }
    }

    return {
      title: this.title,
      meta: [
        { name: 'twitter:card', content: 'summary' },
        { vmid: 'title', name: 'og:title', content: meta.title },
        {
          vmid: 'description',
          name: 'og:description',
          content: meta.description,
        },
        {
          name: 'og:image',
          content: meta.image,
        },
      ],
    };
  },

  title() {
    return this.title;
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadProfilePostsPlaylist', route.params.id);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    entries() {
      return this.$store.getters.playlistEntries('profilePosts');
    },
    ...mapState({
      name: (state) => state.profile.user.name,
      entriesExhausted: (state) =>
        state.playlists.profilePosts.entriesExhausted,
    }),
    playbackSourcePath() {
      return `/users/${this.name}`;
    },
    title() {
      return `${this.name}'s playlist`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadPlaylistPage', { key: 'profilePosts' });
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
