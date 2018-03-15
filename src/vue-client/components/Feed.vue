<template>
  <ul>
    <li v-for="entry in feed.tracks" :key="entry.id">
      {{entry.song.artists[0]}} - {{entry.song.title}}
    </li>
  </ul>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    computed: mapState(['feed']),
  }
</script>

