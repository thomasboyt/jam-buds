import {observable, action} from 'mobx';

import getPlaylist from '../api/getPlaylist';
import {PlaylistEntry as EntryResource} from '../../universal/resources';

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
      this.store.userId = resp.user.id;
      return resp.tracks;
    });
  }
}

export default class ProfileStore {
  @observable entryList: UserPlaylistEntriesList;

  @observable name: string;
  @observable userId: number;

  @action getPlaylist(name: string) {
    this.name = name;
    this.entryList = new UserPlaylistEntriesList(name, this);
    this.entryList.getNextPage();
  }
}
