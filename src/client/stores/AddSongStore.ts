import {observable, action} from 'mobx';
import getSongsSearch from '../api/getSongsSearch';
import getShareLinkDetail from '../api/getShareLinkDetail'
import addSong from '../api/addSong'

import {SearchResult} from '../../universal/resources';

export default class AddSongStore {
  @observable showingAddSong: boolean = false;
  @observable shareLink: string;

  @observable loadedShareLink: boolean = false;
  @observable shareTitle: string;

  @observable loadedSearch: boolean = false;
  @observable searchResults: SearchResult[] = [];

  @action async showAddSongScreen(url: string) {
    this.showingAddSong = true;
    this.shareLink = url;

    this.loadedShareLink = false;
    this.shareTitle = '';

    this.loadedSearch = false;
    this.searchResults = [];

    const detail = await getShareLinkDetail(url);
    this.shareTitle = detail.title;

    this.loadedShareLink = true;
  }

  @action async hideAddSongScreen() {
    this.showingAddSong = false;
  }

  @action async search(query: string) {
    this.searchResults = [];
    this.loadedSearch = false;

    this.searchResults = await getSongsSearch(query);
    this.loadedSearch = true;
  }

  @action async addSong(spotifyId: string) {
    await addSong(spotifyId, this.shareLink);

    this.showingAddSong = false;
  }
}
