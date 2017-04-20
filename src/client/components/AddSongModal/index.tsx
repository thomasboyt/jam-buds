import * as React from 'react';
import * as Modal from 'react-modal';
import {inject, observer} from 'mobx-react';

import AddSongStore, {AddSongState} from '../../stores/AddSongStore';
import InitialScreen from './InitialScreen';
import SearchScreen from './SearchScreen';
import ConfirmScreen from './ConfirmScreen';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
class AddSongModal extends React.Component<Props, {}> {
  handleClose() {
    this.props.addSongStore!.hideAddSongScreen();
  }

  renderInner() {
    const {state} = this.props.addSongStore!.txn;

    let screen;
    if (state === AddSongState.initial) {
      screen = <InitialScreen />;
    } else if (state === AddSongState.searching) {
      screen = <SearchScreen />;
    } else if (state === AddSongState.confirm) {
      screen = <ConfirmScreen />;
    }

    return (
      <div className="add-song-screen">
        <div style={{textAlign: 'center'}}>
          <h2>share a jam!</h2>
        </div>

        {screen}
      </div>
    );
  }

  render() {
    const {showingAddSong} = this.props.addSongStore!;

    return (
      <Modal
        contentLabel="Add song popup"
        isOpen={showingAddSong}
        onRequestClose={() => this.handleClose()}
        className="modal-content"
        overlayClassName="modal-overlay"
        closeTimeoutMS={1000}>
        {showingAddSong ? this.renderInner() : null}
      </Modal>
    );
  }
}

export default AddSongModal;