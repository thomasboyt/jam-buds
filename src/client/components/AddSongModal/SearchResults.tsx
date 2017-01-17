import * as React from 'react';
import {observer, inject} from 'mobx-react';

import AddSongStore from '../../stores/AddSongStore';

import SearchResultItem from './SearchResultItem';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
class SearchResults extends React.Component<Props, {}> {
  render() {
    const {searchResults, loadedSearch} = this.props.addSongStore!.txn;

    if (loadedSearch && searchResults.length === 0) {
      return (
        <div style={{textAlign: 'center', padding: '50px'}}>
          No results found!
        </div>
      );
    }

    return (
      <div>
        <ul>
          {searchResults.map((result) => <SearchResultItem key={result.spotifyId} track={result} />)}
        </ul>
      </div>
    );
  }
}

export default SearchResults;