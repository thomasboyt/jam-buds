<template>
  <div v-if="!entries.length" class="main-placeholder">
    <slot name="placeholder"></slot>
  </div>

  <div v-else>
    <ul class="playlist-entries">
      <li v-for="entry in entries" :key="entry.id">
        <entry-posted-by :entry="entry"></entry-posted-by>
        <playlist-entry
          :entry="entry"
          :playbackSourceLabel="playbackSourceLabel"
          :playbackSourcePath="playbackSourcePath">
        </playlist-entry>
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
  props: [
    'entries',
    'entriesExhausted',
    'loadingNextPage',
    'playbackSourceLabel',
    'playbackSourcePath',
  ],

  components: { EntryPostedBy, PlaylistEntry },

  methods: {
    handleRequestNextPage(evt) {
      evt.preventDefault();
      this.$emit('requestNextPage');
    },
  },
};
</script>
