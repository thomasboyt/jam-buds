<template>
  <div>
    <profile-nav :title="title" />
    <playlist
      :items="items"
      :items-exhausted="itemsExhausted"
      :loading-next-page="loadingNextPage"
      @requestNextPage="handleRequestNextPage"
    >
      <template v-slot:item="{ item }">
        <post-item
          :item="item"
          @requestPlay="handleRequestPlay"
          verb="posted"
        />
      </template>

      <template v-slot:placeholder>
        <p>
          This user has not posted any songs yet :(
        </p>
      </template>
    </playlist>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../components/ProfileNav.vue';
import Playlist from '../../components/playlist/Playlist.vue';
import PostItem from '../../components/playlist/PostItem.vue';

export default {
  components: {
    ProfileNav,
    Playlist,
    PostItem,
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

  async asyncData({ store, route }) {
    await store.dispatch('loadProfilePostsPlaylist', route.params.id);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    ...mapState({
      name: (state) => state.profile.user.name,
    }),
    playlistKey() {
      return `${this.name}/posts`;
    },
    items() {
      return this.$store.getters.playlistItems(this.playlistKey);
    },
    itemsExhausted() {
      return this.$store.state.playlists[this.playlistKey].itemsExhausted;
    },
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

    handleRequestPlay(songId) {
      this.$store.dispatch('playback/playFromPlaylist', {
        songId,
        playlistKey: this.playlistKey,
        playbackSourceLabel: this.title,
        playbackSourcePath: this.playbackSourcePath,
      });
    },
  },
};
</script>
