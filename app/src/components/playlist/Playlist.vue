<template>
  <div v-if="!entries.length" class="main-placeholder">
    <slot name="placeholder"/>
  </div>

  <div v-else>
    <ul class="playlist-entries">
      <li v-for="entry in entries" :key="entry.id">
        <entry-posted-by :entry="entry"/>
        <playlist-entry
          :entry="entry"
          :playback-source-label="playbackSourceLabel"
          :playback-source-path="playbackSourcePath"/>
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
import PlaylistEntry from './PlaylistEntry.vue';

export default {
  components: { EntryPostedBy, PlaylistEntry },

  props: [
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
