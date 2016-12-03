import * as React from 'react';
import {observer, inject} from 'mobx-react';

import AddSongStore from '../stores/AddSongStore';

interface Props {
  addSongStore?: AddSongStore
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore
})) @observer
export default class AddSongButton extends React.Component<Props, {}> {
  handleClick() {
    this.props.addSongStore!.showAddSongScreen();
  }

  render() {
    return (
      <button className="add-song" onClick={() => this.handleClick()}>
        + Post a song!
      </button>
    )
  }
}