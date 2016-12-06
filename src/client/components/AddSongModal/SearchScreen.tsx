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

  renderLoaded() {
    const {shareTitle, manualEntry} = this.props.addSongStore!.txn;

    return (
      <div>
        <p>
          You're sharing the video "{shareTitle}" via YouTube.
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