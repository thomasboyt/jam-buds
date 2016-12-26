import {observable, action} from 'mobx';

import PlaylistEntry from './PlaylistEntry';
import PaginatedPlaylistEntryList from './PaginatedPlaylistEntriesList';

export default class PlaybackStore {
  @observable entryList?: PaginatedPlaylistEntryList;
  @observable nowPlaying?: PlaylistEntry | null;
  @observable playbackIndex: number;

  @observable playbackSourcePath: string;
  @observable playbackSourceLabel: string;

  @observable isPlaying: boolean = false;

  @action playFromList(entryList: PaginatedPlaylistEntryList, index: number) {
    this.entryList = entryList;
    this.playbackIndex = index - 1;  // gets incremented by one on nextSong()
    this.playbackSourcePath = entryList.playbackSourcePath;
    this.playbackSourceLabel = entryList.playbackSourceName;

    this.nextSong();
  }

  @action togglePlayback() {
    this.isPlaying = !this.isPlaying;
  }

  @action stopPlayback() {
    this.entryList = undefined;
    this.nowPlaying = undefined;
    this.isPlaying = false;
  }

  @action async nextSong() {
    if (!this.entryList) {
      return;
    }

    const nextIndex = this.playbackIndex + 1;

    if (nextIndex === this.entryList.items.length) {
      // Out of loaded entries
      if (this.entryList.entriesExhausted) {
        // No more entries to play
        this.stopPlayback();
        return;
      }

      // Load more entries and try again
      await this.entryList.getNextPage();
      this.nextSong();
      return;
    }

    this.playbackIndex = nextIndex;
    this.nowPlaying = this.entryList.items[this.playbackIndex];
    this.isPlaying = true;
  }
}
