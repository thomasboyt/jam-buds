<template>
  <div
    :class="['playlist-song', { 'is-playing': isPlaying, 'can-play': canPlay }]"
  >
    <div class="playlist-song--main" @click="handlePlay">
      <album-art :album-art="song.albumArt" />

      <div class="title">
        <div class="title-content">
          <span class="title-artist">{{ song.artists.join(',') }}</span>
          <br />
          {{ song.title }}
        </div>
      </div>

      <span class="playlist-song--actions">
        <song-play-action :song="song" @play="handlePlay" />
        <song-like-action v-if="showLikeButton" :song="song" />
        <!-- TODO: reintroduce entry deletes -->
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import AlbumArt from './AlbumArt.vue';
import SongLikeAction from './SongLikeAction.vue';
import SongPlayAction from './SongPlayAction.vue';
// import EntryDeleteAction from './EntryDeleteAction.vue';

export default {
  components: {
    AlbumArt,
    SongLikeAction,
    SongPlayAction,
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
    ...mapState({
      canPlay: (state) =>
        state.auth.authenticated && state.currentUser.hasSpotify,
    }),

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
    handlePlay() {
      if (!this.canPlay) {
        return;
      }

      this.$store.dispatch('playback/playSong', {
        song: this.song,
        playbackSourceLabel: this.playbackSourceLabel,
        playbackSourcePath: this.playbackSourcePath,
      });
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

    &.can-play {
      cursor: pointer;
    }
  }
  margin-bottom: 30px;
  display: block;
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

  /deep/ .action-button {
    transition: transform 0.15s linear;
    transform: scale(1);
    padding: 0;
    display: inline-block;

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

      &.heart-filled path {
        fill: var(--theme-text-color);
      }
    }
  }
}
</style>
