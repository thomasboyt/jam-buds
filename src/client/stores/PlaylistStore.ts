import {observable, action} from 'mobx';

import getPlaylist from '../api/getPlaylist';
import {PlaylistEntry as EntryResource} from '../../universal/resources';

import PaginatedPlaylistEntriesList from './PaginatedPlaylistEntriesList';

class UserPlaylistEntriesList extends PaginatedPlaylistEntriesList {
  name: string;
  store: PlaylistStore;

  constructor(name: string, store: PlaylistStore) {
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

export default class PlaylistStore {
  @observable entryList: UserPlaylistEntriesList;
  @observable name: string;
  @observable userId: number;

  @action getPlaylist(name: string) {
    this.name = name;
    this.entryList = new UserPlaylistEntriesList(name, this);
    this.entryList.getNextPage();
  }
}
