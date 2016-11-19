import {observable, action} from 'mobx';
import getSongsSearch from '../api/getSongsSearch';

import {SearchResult} from '../../universal/resources';

export default class SearchStore {
  @observable loadedSearch: boolean = false;
  @observable results: SearchResult[] = [];

  @action async search(query: string) {
    this.results = [];
    this.loadedSearch = false;

    this.results = await getSongsSearch(query);
    this.loadedSearch = true;
  }
}
