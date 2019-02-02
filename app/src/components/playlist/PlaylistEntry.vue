<template>
  <div :class="['playlist-entry', { 'is-playing': isPlaying }]">
    <a
      class="playlist-entry--main"
      :href="sourceUrl"
      target="_blank"
      rel="noopener noreferrer"
      @click="handleClick"
    >
      <album-art :album-art="entry.song.albumArt" />

      <div class="title">
        <div class="title-content">
          {{ entry.song.artists.join(',') }}
          <br />
          {{ entry.song.title }}
        </div>
      </div>

      <span class="playlist-entry--actions">
        <button v-if="entry.note" @click="handleOpenNote">
          <icon :glyph="noteIcon" />
        </button>

        <entry-like-action v-if="showLikeButton" :entry="entry" />
        <entry-delete-action v-if="showDeleteButton" :entry="entry" />

        <button @click="handleToggleOpen" class="drawer-toggle">
          <icon
            :glyph="arrowIcon"
            :class="{ 'arrow-up': isOpen, 'arrow-down': !isOpen }"
          />
        </button>
      </span>
    </a>

    <div :class="['playlist-entry--detail', { open: isOpen }]">
      <p v-if="entry.note" class="track-note">
        {{ entry.note }}
      </p>

      <p>
        <em>
          Listen to this song on:

          <a :href="sourceUrl" target="_blank" rel="noopener noreferrer">
            {{ sourceLabel }}
          </a>
        </em>
      </p>
    </div>
  </div>
</template>

<script>
import Icon from '../Icon.vue';
import AlbumArt from './AlbumArt.vue';
import EntryLikeAction from './EntryLikeAction.vue';
import EntryDeleteAction from './EntryDeleteAction.vue';

const noteIcon = require('../../../assets/note.svg');
const arrowIcon = require('../../../assets/arrow.svg');

export default {
  components: {
    AlbumArt,
    Icon,
    EntryLikeAction,
    EntryDeleteAction,
  },

  props: ['entry', 'playbackSourceLabel', 'playbackSourcePath'],

  data() {
    return {
      noteIcon,
      arrowIcon,

      isOpen: false,

      // TODO: get this from store
      isPlaying: false,
    };
  },

  computed: {
    sourceUrl() {
      const entry = this.entry;

      return {
        youtube: entry.youtubeUrl,
        bandcamp: entry.bandcampUrl,
        soundcloud: entry.soundcloudUrl,
      }[entry.source];
    },

    sourceLabel() {
      const entry = this.entry;

      return {
        youtube: 'Youtube',
        bandcamp: 'Bandcamp',
        soundcloud: 'SoundCloud',
      }[entry.source];
    },

    showLikeButton() {
      const { state } = this.$store;

      // users can't like their own posts
      return (
        state.auth.authenticated &&
        !(state.currentUser.id === this.entry.user.id)
      );
    },

    showDeleteButton() {
      const { state } = this.$store;

      // users can't delete other ppl's posts
      return (
        state.auth.authenticated && state.currentUser.id === this.entry.user.id
      );
    },
  },

  methods: {
    handleClick(evt) {
      evt.preventDefault();
      this.isOpen = true;
      this.$store.dispatch('playback/playSong', {
        entry: this.entry,
        playbackSourceLabel: this.playbackSourceLabel,
        playbackSourcePath: this.playbackSourcePath,
      });
    },

    handleToggleOpen(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.isOpen = !this.isOpen;
    },

    handleOpenNote(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.isOpen = true;
    },
  },
};
</script>

<style scoped lang="scss">
.playlist-entry {
  background-color: rgb(255, 255, 166);
  color: black;
}
</style>
