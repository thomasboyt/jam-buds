<template>
  <div>
    <profile-nav :title="title" />
    <user-playlist :user-name="name" />
  </div>
</template>

<script>
import ProfileNav from '~/components/profile/ProfileNav.vue';
import UserPlaylist from '~/components/playlists/UserPlaylist.vue';

export default {
  components: {
    ProfileNav,
    UserPlaylist,
  },

  head() {
    let meta = {
      title: `${this.name}'s playlist`,
      description: 'check out this playlist on jam buds!',
      image: `${this.$config.STATIC_URL}/corgi_icon_square.png`,
    };

    if (this.$route.query.song) {
      const song = this.$store.state.playlistItems.songs[
        this.$route.query.song
      ];
      if (song) {
        meta = {
          title: song.title,
          description: `${this.name} posted ${song.title} by ${song.artists[0]} on Jam Buds!`,
          image: song.albumArt,
        };
      }
    } else if (this.$route.query.album) {
      const album = this.$store.state.playlistItems.albums[
        this.$route.query.album
      ];
      if (album) {
        meta = {
          title: album.title,
          description: `${this.name} posted ${album.title} by ${album.artists[0]} on Jam Buds!`,
          image: album.albumArt,
        };
      }
    }

    return {
      title: this.title,
      meta: [
        { name: 'twitter:card', content: 'summary' },
        { hid: 'title', name: 'og:title', content: meta.title },
        {
          hid: 'description',
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

  computed: {
    name() {
      return this.$route.params.id;
    },
    title() {
      return `${this.name}'s playlist`;
    },
  },
};
</script>
