import * as React from 'react';
import {inject, observer} from 'mobx-react';

import SearchBox from './SearchBox';
import SearchResults from './SearchResults';

import AddSongStore from '../../stores/AddSongStore';
import UserStore from '../../stores/UserStore';
import serializeSongLabel from '../../util/serializeSongLabel';
import TwitterShareBox from './TwitterShareBox';

interface Props {
  addSongStore?: AddSongStore;
  userStore?: UserStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
class ConfirmScreen extends React.Component<Props, {}> {
  state = {
    crossPostEnabled: false,
  }

  handleToggleTwitter() {
    const crossPostEnabled = !this.state.crossPostEnabled;

    this.setState({
      crossPostEnabled,
    });

    if (!crossPostEnabled) {
      // remove the tweet if cross-post is disabled
      this.props.addSongStore!.updateTweetText(null);
    }
  }

  handleSubmit() {
    this.props.addSongStore!.addSong();
  }

  render() {
    const song = this.props.addSongStore!.txn.selectedSong!;
    const {crossPostEnabled} = this.state;

    return (
      <div>
        <p>you're posting <strong>{serializeSongLabel(song)}</strong></p>

        <p>
          <label>
            <input type="checkbox"
              checked={crossPostEnabled}
              onChange={() => this.handleToggleTwitter()} />
            cross-post to twitter
          </label>
        </p>

        {this.state.crossPostEnabled ? <TwitterShareBox /> : null}

        <button onClick={() => this.handleSubmit()}>
          add
        </button>
      </div>
    );
  }
}

export default ConfirmScreen;