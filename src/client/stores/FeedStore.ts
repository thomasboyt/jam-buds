import {observable, action} from 'mobx';

import getFeed from '../api/getFeed';
import {PlaylistEntry as EntryResource} from '../../universal/resources';

import PaginatedPlaylistEntriesList from './PaginatedPlaylistEntriesList';

class FeedPlaylistEntriesList extends PaginatedPlaylistEntriesList {
  get playbackSourceName() {
    return 'your feed';
  }

  get playbackSourcePath() {
    return '/';
  }

  fetchNextPage(lastId: number | null): Promise<EntryResource[]> {
    return getFeed(lastId).then((resp) => {
      return resp.tracks;
    });
  }
}

export default class FeedStore {
  @observable entryList: FeedPlaylistEntriesList;

  @action reset() {
    this.entryList = new FeedPlaylistEntriesList();
    return this.entryList.getNextPage();
  }
}
