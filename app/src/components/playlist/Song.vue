<template>
  <div
    :class="['playlist-song', { 'is-playing': isPlaying, 'can-play': canPlay }]"
  >
    <div class="playlist-song--main" @click="handleClick">
      <album-art :album-art="song.albumArt" />

      <div class="playlist-song--content">
        <div class="playlist-song--label">
          <slot name="posted-by" />
          <div class="title-content">
            <div class="title-artist">{{ song.artists.join(', ') }}</div>
            <div class="title-song">{{ song.title }}</div>
          </div>
        </div>

        <span class="playlist-song--actions">
          <slot name="actions">
            <song-play-action
              v-if="!isPlaying"
              :song="song"
              @play="handlePlay"
              :can-play="canPlay"
            />
            <song-like-action :song="song" />
            <!-- <song-dropdown-menu
              :song="song"
              :show-delete="showDeleteMenuItem"
            /> -->
          </slot>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

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

      song(state) {
        return state.songs[this.songId];
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

    ...mapGetters('playback', ['currentSong']),

    isPlaying() {
      return this.currentSong && this.currentSong.id === this.song.id;
    },
  },

  methods: {
    handleClick(e) {
      // Don't trigger playback if user was clicking on one of the action
      // buttons
      if (e.target.closest('.action-button')) {
        return;
      }

      this.handlePlay();
    },

    handlePlay() {
      if (!this.canPlay) {
        return;
      }

      this.$emit('requestPlay', this.songId);
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../../styles/mixins.scss';

.playlist-song {
  padding: 10px;
  margin: 0 -10px 10px -10px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);

    &.can-play {
      cursor: pointer;
    }
  }
}

.playlist-song--main {
  display: flex;
  color: var(--theme-text-color);
  text-decoration: none;
  align-items: stretch;
}

.playlist-song--album-art {
  width: 128px;
  height: auto;
  flex: 0 0 auto;
  border: 1px black solid;
  margin-right: 20px;

  &.-placeholder {
    border: none;
    height: 64px;
  }
}

.playlist-song--content {
  display: flex;
  flex-flow: column;
}

.playlist-song--label {
}

.playlist-song--actions {
  margin-top: auto;
}

.title-content {
  display: inline-block;
  width: 100%;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 28px;

  .title-artist {
    font-size: 20px;
    font-weight: 500;
  }

  .title-song {
    font-size: 18px;
  }

  // flex-shrink: 1;
  // flex-grow: 1;
  // max-width: 100%;
  // min-width: 0;

  // margin-right: 10px;
  // line-height: 24px;
}

.playlist-song--actions {
  display: flex;

  > * {
    flex: 0 0 auto;
  }
}

@media (max-width: $breakpoint-small) {
  .playlist-song {
    padding: 5px;
    margin: 0 -5px 15px -5px;
  }

  .playlist-song--album-art {
    margin-right: 10px;
    width: 54px;

    &.-placeholder {
      height: 54px;
    }
  }

  .playlist-song--title {
    font-size: 14px;
    line-height: 20px;
  }

  .playlist-song--actions > * {
    margin-left: 10px;
  }

  /deep/ .action-button {
    padding: 0;

    &:hover {
      background: none;
    }
  }
}
</style>
