<template>
  <div v-if="item.type === 'song'">
    <entry-posted-by
      :timestamp="item.timestamp"
      :names="item.userNames"
      verb="posted"
    />
    <song
      v-if="item.type === 'song'"
      :song-id="item.songId"
      :posted-user-names="item.userNames"
      @requestPlay="handleRequestPlay"
    />
  </div>
  <mixtape-item
    v-else-if="item.type === 'mixtape'"
    :timestamp="item.timestamp"
    :mixtape="item.mixtape"
  />
</template>

<script>
import Song from './Song.vue';
import EntryPostedBy from './EntryPostedBy.vue';
import MixtapeItem from './MixtapeItem.vue';

export default {
  components: { Song, EntryPostedBy, MixtapeItem },

  props: ['item', 'playlistKey', 'playbackSourceLabel', 'playbackSourcePath'],

  methods: {
    handleRequestPlay() {
      this.$store.dispatch('playback/playFromPlaylist', {
        songId: this.item.songId,
        playlistKey: this.playlistKey,
        playbackSourceLabel: this.playbackSourceLabel,
        playbackSourcePath: this.playbackSourcePath,
      });
    },
  },
};
</script>
