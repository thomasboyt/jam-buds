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
    noteText: '',
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

  handleNoteChange(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const noteText = e.currentTarget.value;
    this.setState({noteText});
  }

  handleSubmit() {
    this.props.addSongStore!.addSong(this.state.noteText);
  }

  renderLabel() {
    const {manualArtist, manualTitle, manualEntry, selectedSong} = this.props.addSongStore!.txn;

    if (manualEntry) {
      return `${manualArtist} - ${manualTitle}`;
    } else {
      return serializeSongLabel(selectedSong!);
    }
  }

  render() {
    const song = this.props.addSongStore!.txn.selectedSong!;
    const {crossPostEnabled} = this.state;

    return (
      <div className="confirm-screen">
        <p>you're posting <strong>{this.renderLabel()}</strong></p>

        <div className="note-box">
          <textarea value={this.state.noteText} onChange={(e) => this.handleNoteChange(e)}
            placeholder="(optional) Write a note about this song!" />
        </div>

        <p>
          <label>
            <input type="checkbox"
              checked={crossPostEnabled}
              onChange={() => this.handleToggleTwitter()} />
            {' '} cross-post to twitter
          </label>
        </p>

        {this.state.crossPostEnabled ? <TwitterShareBox /> : null}

        <button onClick={() => this.handleSubmit()} className="submit" data-test="add-song-confirm">
          post it!!
        </button>
      </div>
    );
  }
}

export default ConfirmScreen;