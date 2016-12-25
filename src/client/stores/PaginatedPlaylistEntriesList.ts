import {observable, action, computed} from 'mobx';
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils';

import PlaylistEntry from './PlaylistEntry';
import {PlaylistEntry as EntryResource} from '../../universal/resources';
import {ENTRY_PAGE_LIMIT} from '../../universal/constants';

abstract class PaginatedPlaylistEntriesList {
  @observable items: PlaylistEntry[] = [];

  @observable nextPageRequest?: IPromiseBasedObservable<void>;
  @observable loadedFirstPage: boolean = false;
  @observable entriesExhausted: boolean = false;

  abstract fetchNextPage(lastId: number | null): Promise<EntryResource[]>;

  @action getInitial() {
    // TODO: Okay, there HAS to be a better pattern for this
    this.items = [];
    this.nextPageRequest = undefined;
    this.loadedFirstPage = false;
    this.entriesExhausted = false;

    this.getNextPage();
  }

  @action getNextPage() {
    const lastId = this.lastId;

    this.nextPageRequest = fromPromise(this.fetchNextPage(lastId).then((tracks) => {
      const items = tracks.map((track) => new PlaylistEntry(track, this));
      this.items = this.items.concat(items);
      this.loadedFirstPage = true;
      this.nextPageRequest = undefined;

      if (items.length < ENTRY_PAGE_LIMIT) {
        this.entriesExhausted = true;
      }
    }));
  }

  @computed get lastId() {
    if (this.items.length === 0) {
      return null;
    }

    return this.items.slice(-1)[0].id;
  }

  /**
   * Push an entry to the _top_ of the feed. Called after an entry is added.
   */
  @action pushEntry(entry: EntryResource) {
    this.items.unshift(new PlaylistEntry(entry, this));
  }
}

export default PaginatedPlaylistEntriesList;