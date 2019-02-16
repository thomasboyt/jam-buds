<template>
  <div :class="['playlist-song', { 'is-playing': isPlaying }]">
    <div class="playlist-song--main" @click="handleClick">
      <album-art :album-art="song.albumArt" />

      <div class="title">
        <div class="title-content">
          <span class="title-artist">{{ song.artists.join(',') }}</span>
          <br />
          {{ song.title }}
        </div>
      </div>

      <span class="playlist-song--actions">
        <song-like-action v-if="showLikeButton" :song="song" />
        <!-- TODO: reintroduce entry deletes -->
        <!-- TODO: include youtube icon here -->
      </span>
    </div>
  </div>
</template>

<script>
import AlbumArt from './AlbumArt.vue';
import SongLikeAction from './SongLikeAction.vue';
// import EntryDeleteAction from './EntryDeleteAction.vue';

export default {
  components: {
    AlbumArt,
    SongLikeAction,
    // EntryDeleteAction,
  },

  props: {
    songId: {
      type: Number,
      required: true,
    },
    playbackSourceLabel: {
      type: String,
      required: true,
    },
    playbackSourcePath: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      // TODO: get this from store
      isPlaying: false,
    };
  },

  computed: {
    song() {
      return this.$store.state.songs[this.songId];
    },

    showLikeButton() {
      const { state } = this.$store;

      return state.auth.authenticated;
    },

    // showDeleteButton() {
    //   const { state } = this.$store;

    //   // users can't delete other ppl's posts
    //   return (
    //     state.auth.authenticated && state.currentUser.id === this.entry.user.id
    //   );
    // },
  },

  methods: {
    handleClick(evt) {
      evt.preventDefault();
      this.isOpen = true;
      this.$store.dispatch('playback/playSong', {
        song: this.song,
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
.playlist-song {
  color: var(--theme-text-color);
  border: 3px var(--theme-border-color) solid;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  margin-bottom: 30px;
  display: block;
}

a.playlist-song--main,
a:visited.playlist-song--main {
  color: var(--theme-text-color);
}

.playlist-song--main {
  height: 64px;

  display: flex;
  align-items: center;
  color: var(--theme-text-color);
  text-decoration: none;

  .playlist-song--album-art {
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

.playlist-song--actions {
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

.playlist-song--detail {
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
