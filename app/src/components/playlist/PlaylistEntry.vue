<template>
  <div :class="['playlist-entry', { 'is-playing': isPlaying }]">
    <div class="playlist-entry--main" @click="handleClick">
      <album-art :album-art="entry.song.albumArt" />

      <div class="title">
        <div class="title-content">
          <span class="title-artist">{{ entry.song.artists.join(',') }}</span>
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
    </div>

    <div :class="['playlist-entry--detail', { open: isOpen }]">
      <p v-if="entry.note" class="track-note">
        {{ entry.note }}
      </p>

      <p>
        <em>
          <youtube-search-link :song="entry.song" />
        </em>
      </p>
    </div>
  </div>
</template>

<script>
import Icon from '../Icon.vue';
import AlbumArt from './AlbumArt.vue';
import YoutubeSearchLink from './YoutubeSearchLink.vue';
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
    YoutubeSearchLink,
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
  color: var(--theme-text-color);
  border: 3px var(--theme-border-color) solid;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  margin-bottom: 30px;
  display: block;
}

a.playlist-entry--main,
a:visited.playlist-entry--main {
  color: var(--theme-text-color);
}

.playlist-entry--main {
  height: 64px;

  display: flex;
  align-items: center;
  color: var(--theme-text-color);
  text-decoration: none;

  .playlist-entry--album-art {
    height: 100%;
    flex: 0 0 64px;
    border-right: 3px var(--theme-border-color) solid;

    &.-placeholder {
      height: 80%;
      text-align: center;

      svg {
        height: 100%;
      }
    }
  }

  .title {
    .title-artist {
      font-weight: 500;
    }

    > .title-content {
      display: inline-block;
      width: 100%;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    flex-shrink: 1;
    flex-grow: 1;
    max-width: 100%;
    min-width: 0;

    padding: 0 20px;
    line-height: 24px;
  }
}

.playlist-entry--actions {
  flex-grow: 0;
  flex-shrink: 0;

  margin-left: auto;
  margin-right: 10px;

  /deep/ button {
    transition: transform 0.15s linear;
    transform: scale(1);
    padding: 0;

    &:hover,
    &:active {
      transform: scale(1.3);
    }

    margin-left: 10px;

    &:disabled {
      stroke: grey;
      fill: grey;
    }

    .icon {
      width: 30px;
      height: 30px;

      transform: rotate(0deg);
      transition: transform 0.3s ease-in-out;

      &.heart-filled path {
        fill: var(--theme-text-color);
      }

      &.arrow-up {
        transform: rotate(-180deg);
      }
    }
  }

  .drawer-toggle {
    margin-left: 20px;
    margin-right: 10px;
  }
}

.playlist-entry--detail {
  max-height: 0px;
  overflow: hidden;

  transition: max-height 0.5s ease;

  &.open {
    max-height: 300px;
    overflow: auto;
  }

  padding: 0 10px;

  > p:first-child {
    padding-top: 20px;
  }
}
</style>
