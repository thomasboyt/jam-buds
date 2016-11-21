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
    const {searchResults} = this.props.addSongStore!;

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