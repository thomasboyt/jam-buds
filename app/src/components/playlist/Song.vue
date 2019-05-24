<template>
  <div
    :class="['playlist-song', { 'is-playing': isPlaying, 'can-play': canPlay }]"
  >
    <div class="playlist-song--main" @click="handlePlay">
      <album-art :album-art="song.albumArt" />

      <div class="title">
        <div class="title-content">
          <span class="title-artist">{{ song.artists.join(', ') }}</span>
          <br />
          {{ song.title }}
        </div>
      </div>

      <span class="playlist-song--actions">
        <song-play-action
          v-if="!isPlaying"
          :song="song"
          @play="handlePlay"
          :can-play="canPlay"
        />
        <song-like-action v-if="showLikeButton" :song="song" />
        <song-dropdown-menu :song="song" :show-delete="showDeleteMenuItem" />
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import AlbumArt from './AlbumArt.vue';
import SongLikeAction from './SongLikeAction.vue';
import SongPlayAction from './SongPlayAction.vue';
import SongDropdownMenu from './SongDropdownMenu.vue';

export default {
  components: {
    AlbumArt,
    SongLikeAction,
    SongPlayAction,
    SongDropdownMenu,
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
    postedUserNames: {
      type: Array,
    },
  },

  computed: {
    ...mapState({
      canPlay(state) {
        return (
          state.auth.authenticated &&
          ((state.currentUser.hasSpotify && this.song.spotifyId) ||
            (state.currentUser.hasAppleMusic && this.song.appleMusicId))
        );
      },

      isPlaying(state) {
        const nowPlaying = state.playback.nowPlaying;

        if (!nowPlaying) {
          return false;
        }

        return nowPlaying.id === this.song.id;
      },

      song(state) {
        return state.songs[this.songId];
      },

      showLikeButton(state) {
        return state.auth.authenticated;
      },

      showDeleteMenuItem(state) {
        // users can't delete other ppl's posts
        return (
          state.auth.authenticated &&
          // TODO: this is a good argument for turning the userNames on a
          // playlist entry resource into only users who have _posted_ a song so
          // it doesn't mix up w/ likes...
          this.postedUserNames &&
          this.postedUserNames.includes(state.currentUser.name)
        );
      },
    }),
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
  border-top: 1px var(--theme-text-color) solid;
  padding: 10px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);

    &.can-play {
      cursor: pointer;
    }
  }

  margin-bottom: 10px;
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
    border: 1px black solid;

    &.-placeholder {
      height: 80%;
      text-align: center;
      border: none;

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
    }

    svg {
      fill: var(--theme-text-color);
      stroke: var(--theme-text-color);
      color: var(--theme-text-color);
    }
  }
}
</style>
