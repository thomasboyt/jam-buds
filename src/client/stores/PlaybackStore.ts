import {observable, action} from 'mobx';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaybackStore {
  @observable nowPlaying: PlaylistEntry | null;

  @observable queue: PlaylistEntry[] = [];

  @action playItems(entries: PlaylistEntry[]) {
    this.queue = entries;
    this.nextSong();
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
