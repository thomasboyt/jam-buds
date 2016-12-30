import {observable, action} from 'mobx';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';

import getPlaylist from '../api/getPlaylist';
import getLikedPlaylist from '../api/getLikedPlaylist';
import getFollowers from '../api/getFollowers';
import getFollowing from '../api/getFollowing';
import {PlaylistEntry as EntryResource, PublicUser} from '../../universal/resources';

import PaginatedPlaylistEntriesList from './PaginatedPlaylistEntriesList';

class UserPlaylistEntriesList extends PaginatedPlaylistEntriesList {
  name: string;
  store: ProfileStore;

  get playbackSourceName() {
    return `@${this.name}`;
  }

  get playbackSourcePath() {
    return `/users/${this.name}`;
  }

  constructor(name: string, store: ProfileStore) {
    super();
    this.name = name;
    this.store = store;
  }

  fetchNextPage(lastId: number | null): Promise<EntryResource[]> {
    return getPlaylist(this.name, lastId).then((resp) => {
      return resp.tracks;
    });
  }
}

class UserLikedEntriesList extends PaginatedPlaylistEntriesList {
  name: string;
  store: ProfileStore;

  get playbackSourceName() {
    return `@${this.name}'s likes`;
  }

  get playbackSourcePath() {
    return `/users/${this.name}/liked`;
  }

  constructor(name: string, store: ProfileStore) {
    super();
    this.name = name;
    this.store = store;
  }

  fetchNextPage(lastId: number | null): Promise<EntryResource[]> {
    return getLikedPlaylist(this.name, lastId).then((resp) => {
      return resp.tracks;
    });
  }
}

export default class ProfileStore {
  @observable entryList: UserPlaylistEntriesList;
  @observable likedEntryList: UserLikedEntriesList;

  @observable name: string;

  @observable following: PublicUser[];
  @observable followingRequest: IPromiseBasedObservable<any>;

  @observable followers: PublicUser[];
  @observable followersRequest: IPromiseBasedObservable<any>;

  @action setUser(name: string) {
    this.name = name;
  }

  @action getPlaylist() {
    this.entryList = new UserPlaylistEntriesList(this.name, this);
    this.entryList.getNextPage();
  }

  @action getLikedPlaylist() {
    this.likedEntryList = new UserLikedEntriesList(this.name, this);
    this.likedEntryList.getNextPage();
  }

  @action getFollowing() {
    const promise = getFollowing(this.name).then((users) => {
      this.following = users;
    });

    this.followingRequest = fromPromise(promise);
  }

  @action getFollowers() {
    const promise = getFollowers(this.name).then((users) => {
      this.followers = users;
    });

    this.followersRequest = fromPromise(promise);
  }
}
