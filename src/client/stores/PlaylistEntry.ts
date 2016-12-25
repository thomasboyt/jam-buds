import {observable, action, computed, runInAction} from 'mobx';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';
import likeEntry from '../api/likeEntry';
import unlikeEntry from '../api/unlikeEntry';
import deleteEntry from '../api/deleteEntry';

import {PlaylistEntry as EntryResource, Song, PublicUser} from '../../universal/resources';

import PaginatedPlaylistEntriesList from './PaginatedPlaylistEntriesList';

export default class PlaylistEntry implements EntryResource {
  @observable id: number;
  @observable youtubeUrl: string;
  @observable note: string | null;
  @observable added: string;
  @observable isLiked: boolean;

  @observable song: Song;
  @observable user: PublicUser;

  list: PaginatedPlaylistEntriesList;

  constructor(entry: EntryResource, list: PaginatedPlaylistEntriesList) {
    Object.assign(this, entry);
    this.list =list;
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

  @observable deleteRequest?: IPromiseBasedObservable<void>;

  @action deleteEntry() {
    const fn = async () => {
      await deleteEntry(this.id);
      runInAction(() => {
        this.list.items = this.list.items.filter((item) => item.id !== this.id);
      });
    };

    this.deleteRequest = fromPromise(fn());
  }
}