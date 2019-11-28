<template>
  <div v-if="item.type === 'song'">
    <entry-posted-by
      :timestamp="item.timestamp"
      :names="item.userNames"
      :verb="verb"
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

  props: ['item', 'verb'],

  methods: {
    handleRequestPlay() {
      this.$emit('requestPlay', this.item.songId);
    },
  },
};
</script>
