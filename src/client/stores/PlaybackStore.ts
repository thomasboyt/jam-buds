import {observable, action} from 'mobx';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaybackStore {
  @observable nowPlaying: PlaylistEntry | null;

  // TODO: populate this
  @observable queue: PlaylistEntry[] = [];

  @action playSong(entry: PlaylistEntry) {
    this.nowPlaying = entry;
  }
}
