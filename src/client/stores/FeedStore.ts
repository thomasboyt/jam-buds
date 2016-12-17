import {observable, action, computed} from 'mobx';
import {fromPromise} from 'mobx-utils';

import getFeed from '../api/getFeed';
import {PlaylistEntry} from '../../universal/resources';

export default class FeedStore {
  @observable items: PlaylistEntry[] = [];

  @computed get feedPromise() {
    return fromPromise(getFeed().then((resp) => {
      this.items = resp.tracks;
    }));
  }
}
