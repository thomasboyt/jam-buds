import {observable, action, computed} from 'mobx';
import {fromPromise} from 'mobx-utils';

import getFeed from '../api/getFeed';
import PlaylistEntry from './PlaylistEntry';
import {PlaylistEntry as EntryResource} from '../../universal/resources';

export default class FeedStore {
  @observable items: PlaylistEntry[] = [];

  @computed get feedPromise() {
    return fromPromise(getFeed().then((resp) => {
      this.items = resp.tracks.map((track) => new PlaylistEntry(track, this));
    }));
  }

  @action pushEntry(entry: EntryResource) {
    this.items.unshift(new PlaylistEntry(entry, this));
  }
}
