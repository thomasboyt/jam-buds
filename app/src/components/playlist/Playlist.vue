<template>
  <div v-if="!entries.length" class="main-placeholder">
    <slot name="placeholder" />
  </div>

  <div v-else>
    <ul class="playlist-entries">
      <li v-for="entry in entries" :key="entry.id">
        <entry-posted-by :entry="entry" v-if="entryType === 'post'" />

        <song
          :song="entry.song"
          :playback-source-label="playbackSourceLabel"
          :playback-source-path="playbackSourcePath"
        />
      </li>
    </ul>

    <div v-if="!entriesExhausted">
      <div v-if="loadingNextPage">
        Loading...
      </div>

      <a v-else href="#" @click="handleRequestNextPage">
        Load next page
      </a>
    </div>
  </div>
</template>

<script>
import EntryPostedBy from './EntryPostedBy.vue';
import Song from './Song.vue';

export default {
  components: { EntryPostedBy, Song },

  props: [
    'entryType',
    'entries',
    'entriesExhausted',
    'loadingNextPage',
    'playbackSourceLabel',
    'playbackSourcePath',
  ],

  methods: {
    handleRequestNextPage(evt) {
      evt.preventDefault();
      this.$emit('requestNextPage');
    },
  },
};
</script>

<style lang="scss" scoped>
ul.playlist-entries {
  list-style-type: none;
  padding-left: 0px;
}
</style>
