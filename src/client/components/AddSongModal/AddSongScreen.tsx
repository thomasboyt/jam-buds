import * as React from 'react';
import {inject, observer} from 'mobx-react';

import SearchBox from './SearchBox';
import SearchResults from './SearchResults';

import AddSongStore from '../../stores/AddSongStore';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
class AddSongScreen extends React.Component<Props, {}> {
  renderLoaded() {
    const {shareTitle} = this.props.addSongStore!;

    return (
      <div>
        <p>
          You're adding "{shareTitle}" via YouTube.
        </p>

        <SearchBox />
        <SearchResults />
      </div>
    );
  }

  render() {
    const {loadedShareLink} = this.props.addSongStore!;

    return (
      <div className="add-song-screen">
        <div style={{textAlign: 'center'}}>
          <h2>share a jam!</h2>
        </div>

        {loadedShareLink ? this.renderLoaded() : <div>loading...</div>}
      </div>
    );
  }
}

export default AddSongScreen;