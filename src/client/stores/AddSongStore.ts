import {observable, action, computed} from 'mobx';
import getSongsSearch from '../api/getSongsSearch';
import getShareLinkDetail from '../api/getShareLinkDetail'
import addSong from '../api/addSong'
import {getTweetLength} from '../util/songTweet';
import {SearchResult} from '../../universal/resources';

import FeedStore from './FeedStore';
import PlaylistStore from './PlaylistStore';

export enum AddSongState {
  initial,
  searching,
  confirm,
}

// This class just contains the "transaction" and gets reset when the modal is open/closed
class AddSongTransaction {
  @observable state: AddSongState = AddSongState.initial;
  @observable shareLink: string;

  @observable loadedShareLink: boolean = false;
  @observable shareTitle: string;
  @observable shareEmbeddable: boolean;

  @observable loadedSearch: boolean = false;
  @observable searchResults: SearchResult[] = [];

  @observable selectedSong: SearchResult | null = null;

  @observable manualEntry: boolean = false;
  @observable manualArtist?: string;
  @observable manualTitle?: string;

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

  feedStore: FeedStore;
  playlistStore: PlaylistStore;

  constructor(feedStore: FeedStore, playlistStore: PlaylistStore) {
    this.feedStore = feedStore;
    this.playlistStore = playlistStore;
  }

  @action async showAddSongScreen() {
    this.showingAddSong = true;

    this.txn = new AddSongTransaction();
  }

  @action async hideAddSongScreen() {
    this.showingAddSong = false;
  }

  @action async submitSongLink(url: string) {
    this.txn.shareLink = url;
    this.txn.state = AddSongState.searching;

    const detail = await getShareLinkDetail(url);
    this.txn.shareTitle = detail.title;
    this.txn.shareEmbeddable = detail.embeddable;

    this.txn.loadedShareLink = true;
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

  @action manualEntry(artist: string, title: string) {
    this.txn.manualArtist = artist;
    this.txn.manualTitle = title;
    this.txn.state = AddSongState.confirm;
  }

  @action async addSong(noteText: string) {
    if (this.txn.tweetLength > 140) {
      // lol
      alert('Tweet too long, man!!!');
      return;
    }

    const note = noteText !== '' ? noteText : undefined;

    const entry = await addSong({
      manualEntry: this.txn.manualEntry,
      artist: this.txn.manualArtist,
      title: this.txn.manualTitle,
      spotifyId: this.txn.selectedSong && this.txn.selectedSong.spotifyId,

      youtubeUrl: this.txn.shareLink,

      tweet: this.txn.tweetText,
      note,
    });

    this.showingAddSong = false;

    this.feedStore.pushEntry(entry);

    if (entry.user.id === this.playlistStore.userId) {
      this.playlistStore.pushEntry(entry);
    }
  }

  @action updateTweetText(text: string | null) {
    this.txn.tweetText = text;
  }
}
