import {observable, action} from 'mobx';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaybackStore {
  @observable nowPlaying: PlaylistEntry | null;
  @observable isPlaying: boolean = false;
  @observable playlistUser: string | null;
  @observable fromFeed: boolean = false;

  @observable queue: PlaylistEntry[] = [];

  @action playFeedItems(entries: PlaylistEntry[]) {
    this.isPlaying = true;
    this.queue = entries;
    this.playlistUser = null;
    this.fromFeed = true;

    this.nextSong();
  }

  @action playPlaylistItems(entries: PlaylistEntry[], username: string) {
    this.isPlaying = true;
    this.queue = entries;
    this.playlistUser = username;
    this.fromFeed = false;

    this.nextSong();
  }

  @action togglePlayback() {
    this.isPlaying = !this.isPlaying;
  }

  @action nextSong() {
    if (this.queue.length === 0) {
      this.nowPlaying = null;
      this.isPlaying = false;
      this.playlistUser = null;
      return;
    }

    this.isPlaying = true;
    this.nowPlaying = this.queue[0];
    this.queue = this.queue.slice(1);
  }
}
