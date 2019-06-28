/* global SpotifyHandler */

export default class SpotifyAndroidPlayer {
  constructor({ store }) {
    this.store = store;
  }

  async initialize() {
    // TODO: Clean this up?
    this._onPlaybackStateChange = this.onPlaybackStateChange.bind(this);
    window.addEventListener('spotifyPlayerState', this._onPlaybackStateChange);
  }

  play() {
    SpotifyHandler.resume();
  }

  pause() {
    SpotifyHandler.pause();
  }

  async setSong(song) {
    const track = `spotify:track:${song.spotifyId}`;
    SpotifyHandler.playSong(track);
  }

  onPlaybackStateChange(evt) {
    const state = evt.detail;
    const syncState = {
      isPlaying: !state.isPaused,
    };
    console.log('syncing', syncState);
    this.store.dispatch('playback/sync', syncState);
  }
}
