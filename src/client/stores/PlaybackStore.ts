import {observable, action} from 'mobx';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaybackStore {
  @observable nowPlaying: PlaylistEntry | null;

  // TODO: populate this
  @observable queue: PlaylistEntry[] = [];

  @action playItems(entries: PlaylistEntry[]) {
    this.nowPlaying = entries[0];
    this.queue = entries.slice(1);
  }

  @action nextSong() {
    if (this.queue.length === 0) {
      this.nowPlaying = null;
      return;
    }

    this.nowPlaying = this.queue[0];
    this.queue = this.queue.slice(1);
  }
}
