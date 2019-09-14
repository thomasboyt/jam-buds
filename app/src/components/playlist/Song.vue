<template>
  <div
    :class="['playlist-song', { 'is-playing': isPlaying, 'can-play': canPlay }]"
  >
    <div class="playlist-song--main" @click="handleClick">
      <album-art :album-art="song.albumArt" :is-playing="isPlaying" />

      <div class="playlist-song--title">
        <div class="title-content">
          <span class="title-artist">{{ song.artists.join(', ') }}</span>
          <br />
          {{ song.title }}
        </div>
        <song-like-action :mobile="true" :song="song" />
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
          <song-dropdown-menu :song="song" :show-delete="showDeleteMenuItem" />
        </slot>
      </span>
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
  align-items: center;
  color: var(--theme-text-color);
  text-decoration: none;
}

.playlist-song--title {
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

  margin-right: 10px;
  line-height: 24px;
}

.playlist-song--actions {
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: auto;

  display: flex;

  > * {
    flex: 0 0 auto;
  }
}

/deep/ .action-button {
  border-radius: 500px;
  padding: 8px;

  .icon {
    width: 25px;
    height: 25px;
  }

  svg {
    color: var(--theme-text-color);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    cursor: default;
    &:hover {
      background: none;
    }
  }
}

@media (max-width: $breakpoint-small) {
  .playlist-song {
    padding: 5px;
    margin: 0 -5px 15px -5px;
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
