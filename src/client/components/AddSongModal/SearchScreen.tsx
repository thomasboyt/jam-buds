import * as React from 'react';
import {inject, observer} from 'mobx-react';

import SearchBox from './SearchBox';
import SearchResults from './SearchResults';
import ManualEntryForm from './ManualEntryForm';

import AddSongStore from '../../stores/AddSongStore';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
class SearchScreen extends React.Component<Props, {}> {
  handleToggleManualEntry(e: React.SyntheticEvent<HTMLAnchorElement>) {
    e.preventDefault();

    this.props.addSongStore!.txn.manualEntry = !(this.props.addSongStore!.txn.manualEntry);
  }

  handleReturnToInitialScreen(e: React.SyntheticEvent<HTMLAnchorElement>) {
    e.preventDefault();

    this.props.addSongStore!.showAddSongScreen();
  }

  renderManualEntry() {
    return (
      <div>
        <ManualEntryForm />

        Or{' '}
        <a onClick={(e) => this.handleToggleManualEntry(e)} href="#">
          search for a song
        </a>
      </div>
    );
  }

  renderSearch() {
    return (
      <div>
        <p>
          To finish sharing, just search for the song title and artist that matches this video:
        </p>

        <SearchBox />

        <SearchResults />

        Or{' '}
        <a onClick={(e) => this.handleToggleManualEntry(e)} href="#">
          manually enter a title and artist
        </a>
      </div>
    );
  }

  renderNotEmbeddable() {
    const {shareTitle, shareSourceName} = this.props.addSongStore!.txn;

    return (
      <div>
        <p>
          You tried to share the video "{shareTitle}" via {shareSourceName}, but unfortunately, this video can't be embedded on Jam Buds due to restrictions set by the video's uploader.
        </p>
        <p>
          We recommend trying to find another video for this song!
        </p>
        <a onClick={(e) => this.handleReturnToInitialScreen(e)} href="#">
          Try again
        </a>
      </div>
    );
  }

  renderLoaded() {
    const {shareTitle, manualEntry, shareEmbeddable, shareSourceName} = this.props.addSongStore!.txn;

    if (!shareEmbeddable) {
      return this.renderNotEmbeddable();
    }

    return (
      <div>
        <p>
          You're sharing the video "{shareTitle}" via {shareSourceName}.
        </p>

        {manualEntry ? this.renderManualEntry() : this.renderSearch()}
      </div>
    );
  }

  render() {
    const {loadedShareLink} = this.props.addSongStore!.txn;

    return loadedShareLink ? this.renderLoaded() : <div>loading...</div>;
  }
}

export default SearchScreen;