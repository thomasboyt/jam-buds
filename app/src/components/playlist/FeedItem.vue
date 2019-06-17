<template>
  <div v-if="item.type === 'song'">
    <entry-posted-by :entry="item" entry-type="feed-entry" />
    <song
      v-if="item.type === 'song'"
      :song-id="item.songId"
      :posted-user-names="item.userNames"
      @requestPlay="handleRequestPlay"
    />
  </div>
  <mixtape-item v-else-if="item.type === 'mixtape'" :mixtape="item.mixtape" />
</template>

<script>
import Song from './Song.vue';
import EntryPostedBy from './EntryPostedBy.vue';

export default {
  components: { Song, EntryPostedBy },

  props: ['item', 'playbackSourceLabel', 'playbackSourcePath'],

  methods: {
    handleRequestPlay() {
      this.$store.dispatch('playback/enqueueAndPlaySongs', {
        songIds: [this.item.songId],
        playbackSourceLabel: this.playbackSourceLabel,
        playbackSourcePath: this.playbackSourcePath,
      });
    },
  },
};
</script>
