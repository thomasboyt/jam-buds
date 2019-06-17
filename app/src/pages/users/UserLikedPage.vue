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
        <entry-posted-by :entry="item" entry-type="playlist-entry" />
        <song :song-id="item.songId" @requestPlay="handleRequestPlay" />
      </template>

      <template v-slot:placeholder>
        <p>
          This user has not liked any songs yet :(
        </p>
      </template>
    </playlist>
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
    return {
      title: this.title,
    };
  },

  async asyncData({ store, route }) {
    await store.dispatch('loadProfileLikesPlaylist', route.params.id);
  },

  data() {
    return {
      loadingNextPage: false,
    };
  },

  computed: {
    items() {
      return this.$store.getters.playlistItems('profileLikes');
    },
    ...mapState({
      name: (state) => state.profile.user.name,
      itemsExhausted: (state) => state.playlists.profileLikes.itemsExhausted,
    }),
    playbackSourcePath() {
      return `/users/${this.name}/liked`;
    },
    title() {
      return `${this.name}'s liked tracks`;
    },
  },

  methods: {
    async handleRequestNextPage() {
      this.loadingNextPage = true;

      try {
        await this.$store.dispatch('loadPlaylistPage', { key: 'profileLikes' });
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
