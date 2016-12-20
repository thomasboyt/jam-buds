import {observable, action, computed} from 'mobx';
import {fromPromise} from 'mobx-utils';

import getPlaylist from '../api/getPlaylist';
import likeEntry from '../api/likeEntry';
import PlaylistEntry from './PlaylistEntry';

export default class PlaylistStore {
  @observable name: string;
  @observable userId: number;

  @observable items: PlaylistEntry[] = [];

  @action getPlaylist(name: string) {
    this.name = name;
  }

  @computed get itemsPromise() {
    return fromPromise(getPlaylist(this.name).then((resp) => {
      this.items = resp.tracks.map((track) => new PlaylistEntry(track, this));
      this.userId = resp.user.id;
    }));
  }
}
