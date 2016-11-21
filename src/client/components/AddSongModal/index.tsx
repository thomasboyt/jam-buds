import * as React from 'react';
import * as Modal from 'react-modal';
import {inject, observer} from 'mobx-react';

import AddSongStore from '../../stores/AddSongStore';
import AddSongScreen from './AddSongScreen';

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

  render() {
    const {showingAddSong} = this.props.addSongStore!;

    return (
      <Modal
        isOpen={showingAddSong}
        onRequestClose={() => this.handleClose()}
        className="modal-content"
        overlayClassName="modal-overlay"
        closeTimeoutMS={1000}>
        {showingAddSong ? <AddSongScreen /> : null}
      </Modal>
    );
  }
}

export default AddSongModal;