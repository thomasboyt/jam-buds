import {observable, action, computed} from 'mobx';
import getSongsSearch from '../api/getSongsSearch';
import getShareLinkDetail from '../api/getShareLinkDetail'
import addSong from '../api/addSong'
import {getTweetLength} from '../util/songTweet';

import {SearchResult} from '../../universal/resources';

export enum AddSongState {
  searching,
  confirm,
}

// This class just contains the "transaction" and gets reset when the modal is open/closed
class AddSongTransaction {
  @observable state: AddSongState = AddSongState.searching;
  @observable shareLink: string;

  @observable loadedShareLink: boolean = false;
  @observable shareTitle: string;

  @observable loadedSearch: boolean = false;
  @observable searchResults: SearchResult[] = [];

  // TODO: Type-check this
  @observable selectedSong: SearchResult | null = null;

  @observable tweetText: string | null = null;

  @computed get tweetLength(): number {
    if (this.tweetText === null) {
      return 0;
    }

    return getTweetLength(this.tweetText);
  }
}

export default class AddSongStore {
  @observable showingAddSong: boolean = false;
  @observable txn: AddSongTransaction;

  @action async showAddSongScreen(url: string) {
    this.showingAddSong = true;

    this.txn = new AddSongTransaction();
    this.txn.shareLink = url;

    const detail = await getShareLinkDetail(url);
    this.txn.shareTitle = detail.title;

    this.txn.loadedShareLink = true;
  }

  @action async hideAddSongScreen() {
    this.showingAddSong = false;
  }

  @action async search(query: string) {
    this.txn.searchResults = [];
    this.txn.loadedSearch = false;

    this.txn.searchResults = await getSongsSearch(query);
    this.txn.loadedSearch = true;
  }

  @action selectSearchResult(song: SearchResult) {
    this.txn.selectedSong = song;
    this.txn.state = AddSongState.confirm;
  }

  @action unselectSearchresult() {
    this.txn.selectedSong = null;
    this.txn.state = AddSongState.searching;
  }

  @action async addSong() {
    if (this.txn.tweetLength > 140) {
      // lol
      alert('Tweet too long, man!!!');
      return;
    }

    await addSong({
      spotifyId: this.txn.selectedSong!.spotifyId,
      url: this.txn.shareLink,
      tweet: this.txn.tweetText,
    });

    this.showingAddSong = false;
  }

  @action updateTweetText(text: string | null) {
    this.txn.tweetText = text;
  }
}
