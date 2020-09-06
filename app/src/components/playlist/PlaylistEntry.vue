<template>
  <div>
    <song
      v-if="item.type === 'song'"
      :song-id="item.songId"
      :posted-user-names="postedUserNames"
      @requestPlay="handleRequestPlay"
    />
    <mixtape-item v-else-if="item.type === 'mixtape'" :mixtape="item.mixtape" />
  </div>
</template>

<script>
import Song from './Song.vue';
import MixtapeItem from './MixtapeItem.vue';

export default {
  components: { Song, MixtapeItem },

  props: ['item'],

  computed: {
    postedUserNames() {
      return this.item.posts && this.item.posts.map((post) => post.userName);
    },
  },

  methods: {
    handleRequestPlay() {
      this.$emit('requestPlay', this.item.songId);
    },
  },
};
</script>
