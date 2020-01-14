<template>
  <div
    :class="[
      'playlist-song',
      { 'is-playing': isPlaying, 'can-click': canClickSong },
    ]"
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
          (state.streaming.hasSpotify && this.song.spotifyId) ||
          (state.streaming.hasAppleMusic && this.song.appleMusicId)
        );
      },

      userHasStreamingService(state) {
        return state.streaming.hasSpotify || state.streaming.hasAppleMusic;
      },

      song(state) {
        return state.songs[this.songId];
      },

      // users can't delete other ppl's posts
      showDeleteMenuItem(state) {
        if (!state.auth.authenticated) {
          return false;
        }

        if (this.postedUserNames) {
          return this.postedUserNames.includes(state.currentUser.name);
        }

        // HACK: This should probably use props passed down instead of going off
        // of route
        if (this.$route.path === `/users/${state.currentUser.name}`) {
          return true;
        }

        return false;
      },
    }),

    ...mapGetters('playback', ['currentSong']),

    // TODO: once a modal is implemented for apple music song-missing state,
    // this will just always be true
    canClickSong() {
      const { streaming } = this.$store.state;

      // for users with a connected streaming service, the song is clickable
      // if it can be played on that service
      if (streaming.hasSpotify) {
        return !!this.song.spotifyId;
      } else if (streaming.hasAppleMusic) {
        return !!this.song.appleMusicId;
      }

      // for all other users, the song is always clickable, so it can trigger
      // the connect-streaming banner
      return true;
    },

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

      // Don't pop show-connect banner if the streaming services haven't loaded yet
      // In the future this may do some kind of special queueing...
      if (!this.$store.getters.loadedStreaming) {
        return;
      }

      if (this.userHasStreamingService) {
        if (this.canPlay) {
          this.handlePlay();
        }
      } else {
        this.$store.commit('showConnectStreamingBanner');
      }
    },

    handlePlay() {
      if (this.canPlay) {
        this.$emit('requestPlay', this.songId);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '~/assets/styles/mixins.scss';

.playlist-song {
  padding: 10px;
  margin: 0 -10px 10px -10px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);

    &.can-click {
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
