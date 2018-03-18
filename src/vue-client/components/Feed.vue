<template>
  <div class="playlist">

    <h2>your feed</h2>
    <ul class="playlist-entries">
      <li v-for="entry in feedEntries" :key="entry.id">
        <feed-posted-by :entry="entry"></feed-posted-by>
        <playlist-entry :entry="entry"></playlist-entry>
      </li>
    </ul>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import PlaylistEntry from './playlist/PlaylistEntry.vue';
  import FeedPostedBy from './playlist/FeedPostedBy.vue';

  export default {
    components: {PlaylistEntry, FeedPostedBy},

    computed: {
      ...mapGetters(['feedEntries']),
    },
  }
</script>