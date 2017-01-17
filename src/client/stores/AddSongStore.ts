import {observable, action, computed} from 'mobx';
import getSongsSearch from '../api/getSongsSearch';
import getShareLinkDetail from '../api/getShareLinkDetail'
import addSong from '../api/addSong'
import {getTweetLength} from '../util/songTweet';

import {SearchResult, ManualEntrySuggestion, PlaybackSource} from '../../universal/resources';
import {getPlaybackSourceName} from '../../universal/playbackSources';

import FeedStore from './FeedStore';
import ProfileStore from './ProfileStore';

export enum AddSongState {
  initial,
  searching,
  confirm,
}

// This class just contains the "transaction" and gets reset when the modal is open/closed
class AddSongTransaction {
  @observable state: AddSongState = AddSongState.initial;
  @observable shareLink: string;
  @observable shareSource: PlaybackSource;
  @observable shareSourceName: string;

  @observable loadedShareLink: boolean = false;
  @observable shareTitle: string;
  @observable shareEmbeddable: boolean;

  @observable loadedSearch: boolean = false;
  @observable searchResults: SearchResult[] = [];

  @observable selectedSong: SearchResult | null = null;

  @observable bandcampTrackId?: string;
  @observable soundcloudTrackId?: string;

  @observable manualEntry: boolean = false;
  @observable manualEntrySuggestion?: ManualEntrySuggestion;
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
  profileStore: ProfileStore;

  constructor(feedStore: FeedStore, profileStore: ProfileStore) {
    this.feedStore = feedStore;
    this.profileStore = profileStore;
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

    this.txn.shareEmbeddable = detail.embeddable;
    this.txn.shareTitle = detail.title;
    this.txn.shareSource = detail.source;
    this.txn.shareSourceName = getPlaybackSourceName(detail.source);

    if (detail.spotify) {
      // go ahead and advance to the last screen
      this.txn.selectedSong = detail.spotify;
      this.txn.state = AddSongState.confirm;
    }

    if (detail.manualEntrySuggestion) {
      this.txn.manualEntrySuggestion = detail.manualEntrySuggestion;

      if (!detail.spotify) {
        this.txn.manualEntry = true;
      }
    }

    if (detail.source === 'bandcamp') {
      this.txn.bandcampTrackId = detail.bandcampTrackId!;

    } else if (detail.source === 'soundcloud') {
      this.txn.soundcloudTrackId = detail.soundcloudTrackId!;
    }

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

    const source = this.txn.shareSource;

    const entry = await addSong({
      source,

      manualEntry: this.txn.manualEntry,
      artist: this.txn.manualArtist,
      title: this.txn.manualTitle,
      spotifyId: this.txn.selectedSong && this.txn.selectedSong.spotifyId,

      youtubeUrl: source === 'youtube' ? this.txn.shareLink : undefined,
      bandcampTrackId: source === 'bandcamp' ? this.txn.bandcampTrackId! : undefined,
      bandcampUrl: source === 'bandcamp' ? this.txn.shareLink : undefined,

      soundcloudTrackId: source === 'soundcloud' ? this.txn.soundcloudTrackId! : undefined,
      soundcloudUrl: source === 'soundcloud' ? this.txn.shareLink : undefined,

      tweet: this.txn.tweetText,
      note,
    });

    this.showingAddSong = false;

    // this is not always instantiated...
    if (this.feedStore.entryList) {
      this.feedStore.entryList.pushEntry(entry);
    }

    if (entry.user.twitterName === this.profileStore.name) {
      this.profileStore.entryList.pushEntry(entry);
    }
  }

  @action updateTweetText(text: string | null) {
    this.txn.tweetText = text;
  }
}
