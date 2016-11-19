import {observable, action} from 'mobx';

interface SearchResult {
  artists: string[];
  album: string[];
  name: string;
}

export default class SearchStore {
  @observable loadedSearch: boolean = false;
  @observable results: SearchResult[] = [];

  @action async search(query: string) {
  }
}
