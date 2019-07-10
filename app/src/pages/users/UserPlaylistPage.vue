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
        <entry-posted-by :timestamp="item.timestamp" verb="posted" />
        <song
          :song-id="item.songId"
          :posted-user-names="[name]"
          @requestPlay="handleRequestPlay"
        />
      </template>

      <template v-slot:placeholder>
        <p>
          This user has not posted any songs yet :(
        </p>
      </template>
    </playlist>

    <router-view />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ProfileNav from '../../components/ProfileNav.vue';
import Playlist from '../../components/playlist/Playlist.vue';
import EntryPostedBy from '../../components/playlist/EntryPostedBy.vue';
import Song from '../../components/playlist/Song.vue';

export default {
  components: {
    ProfileNav,
    Playlist,
    EntryPostedBy,
    Song,
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
    items() {
      return this.$store.getters.playlistItems('profilePosts');
    },
    ...mapState({
      name: (state) => state.profile.user.name,
      itemsExhausted: (state) => state.playlists.profilePosts.itemsExhausted,
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

    handleRequestPlay(songId) {
      this.$store.dispatch('playback/enqueueAndPlaySongs', {
        songIds: [songId],
        playbackSourceLabel: this.title,
        playbackSourcePath: this.playbackSourcePath,
      });
    },
  },
};
</script>
