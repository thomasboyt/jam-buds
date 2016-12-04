import {observable, action, computed} from 'mobx';
import {fromPromise} from 'mobx-utils';

import getPlaylist from '../api/getPlaylist';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaylistStore {
  @observable name: string;
  @observable userId: number;

  @observable items: PlaylistEntry[] = [];

  @action getPlaylist(name: string) {
    this.name = name;
  }

  @computed get itemsPromise() {
    return fromPromise(getPlaylist(this.name).then((resp) => {
      this.items = resp.tracks;
      this.userId = resp.user.id;
    }));
  }
}
