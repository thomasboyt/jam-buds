import {observable, action, computed, runInAction} from 'mobx';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';
import likeEntry from '../api/likeEntry';
import unlikeEntry from '../api/unlikeEntry';
import deleteEntry from '../api/deleteEntry';

import {PlaylistEntry as EntryResource, Song, PublicUser, PlaybackSource} from '../../universal/resources';

import PaginatedPlaylistEntriesList from './PaginatedPlaylistEntriesList';

export default class PlaylistEntry implements EntryResource {
  @observable id: number;

  @observable source: PlaybackSource;

  @observable youtubeUrl: string;

  @observable bandcampStreamingUrl: string;
  @observable bandcampUrl: string;

  @observable soundcloudStreamingUrl: string;
  @observable soundcloudUrl: string;

  @observable note: string | null;
  @observable added: string;
  @observable isLiked: boolean;

  @observable song: Song;
  @observable user: PublicUser;

  @computed get sourceUrl(): string {
    const urls = {
      youtube: this.youtubeUrl,
      bandcamp: this.bandcampUrl,
      soundcloud: this.soundcloudUrl,
    };

    return urls[this.source];
  }

  list: PaginatedPlaylistEntriesList;

  constructor(entry: EntryResource, list: PaginatedPlaylistEntriesList) {
    Object.assign(this, entry);
    this.list = list;
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