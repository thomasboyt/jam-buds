/* global MusicKit */

export default class AppleMusicPlayer {
  constructor({ store }) {
    this._state = 'created';
    this.store = store;
  }

  play() {
    console.log('resuming');
    MusicKit.getInstance().play();
  }

  pause() {
    console.log('pausing');
    MusicKit.getInstance().pause();
  }

  setVolume(volume) {
    MusicKit.getInstance().player.volume = volume;
  }

  async setSong(song) {
    this.songEnded = false;

    this.store.dispatch('playback/sync', {
      isBuffering: true,
    });

    await MusicKit.getInstance().setQueue({
      song: song.appleMusicId,
    });

    await MusicKit.getInstance().play();
  }

  async initialize({ initialVolume }) {
    const instance = MusicKit.getInstance();

    instance.addEventListener('playbackStateDidChange', (evt) =>
      this.onPlaybackStateChange(evt)
    );

    instance.addEventListener('playbackDurationDidChange', (evt) => {
      this.store.dispatch('playback/sync', {
        secondsTotal: evt.duration,
      });
    });

    instance.addEventListener('playbackTimeDidChange', (evt) => {
      this.store.dispatch('playback/sync', {
        secondsElapsed: evt.currentPlaybackTime,
      });
    });

    this.setVolume(initialVolume);
  }

  onPlaybackStateChange(evt) {
    const stateKeyForState = (state) => {
      for (const key of Object.keys(MusicKit.PlaybackStates)) {
        if (MusicKit.PlaybackStates[key] === state) {
          return key;
        }
      }
    };
    console.log('musickit state:', stateKeyForState(evt.state));

    if (
      evt.state === MusicKit.PlaybackStates.loading ||
      evt.state === MusicKit.PlaybackStates.waiting ||
      evt.state === MusicKit.PlaybackStates.stalled ||
      evt.state === MusicKit.PlaybackStates.seeking
    ) {
      this.store.dispatch('playback/sync', {
        isBuffering: true,
      });
    } else {
      this.store.dispatch('playback/sync', {
        isBuffering: false,
      });
    }

    if (
      evt.state === MusicKit.PlaybackStates.paused ||
      evt.state === MusicKit.PlaybackStates.stopped ||
      evt.state === MusicKit.PlaybackStates.ended ||
      evt.state === MusicKit.PlaybackStates.completed
    ) {
      this.store.dispatch('playback/sync', {
        isPlaying: false,
      });
    } else {
      this.store.dispatch('playback/sync', {
        isPlaying: true,
      });
    }

    if (evt.state === MusicKit.PlaybackStates.completed) {
      this.store.dispatch('playback/nextSong');
    }
  }
}
