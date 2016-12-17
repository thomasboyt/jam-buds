import {observable, action, computed, runInAction} from 'mobx';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';
import likeEntry from '../api/likeEntry';
import unlikeEntry from '../api/unlikeEntry';

import {PlaylistEntry as EntryResource, Song, PublicUser} from '../../universal/resources';

export default class PlaylistEntry implements EntryResource {
  @observable id: number;
  @observable youtubeUrl: string;
  @observable note: string | null;
  @observable added: string;
  @observable isLiked: boolean;

  @observable song: Song;
  @observable user: PublicUser;

  constructor(entry: EntryResource) {
    Object.assign(this, entry);
  }

  @observable likeRequest?: IPromiseBasedObservable<void>;

  @action likeEntry() {
    const fn = async () => {
      await likeEntry(this.id);
      runInAction(() => {
        this.likeRequest = undefined;
        this.isLiked = true;
      });
    };

    this.likeRequest = fromPromise(fn());
  }

  @action unlikeEntry() {
    const fn = async () => {
      await unlikeEntry(this.id);
      runInAction(() => {
        this.likeRequest = undefined;
        this.isLiked = false;
      });
    };

    this.likeRequest = fromPromise(fn());
  }
}