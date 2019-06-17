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
  <!-- <mixtape-item
    v-else-if="entry.type === 'mixtape'"
    :mixtape-id="entry.mixtape.id"
    :author-name="entry.mixtape.author.name"
  /> -->
</template>

<script>
import Song from './playlist/Song.vue';
import EntryPostedBy from './playlist/EntryPostedBy.vue';

export default {
  components: { Song, EntryPostedBy },

  props: ['item'],

  methods: {
    handleRequestPlay() {
      this.$store.dispatch('playback/enqueueAndPlaySongs', {
        songIds: [this.item.songId],
        playbackSourceLabel: 'your feed',
        playbackSourcePath: '/',
      });
    },
  },
};
</script>
