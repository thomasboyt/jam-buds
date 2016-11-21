import * as React from 'react';
import {observer, inject} from 'mobx-react';

import AddSongStore from '../stores/AddSongStore';
import getSongsSearch from '../api/getSongsSearch';

interface Props {
  addSongStore?: AddSongStore
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore
})) @observer
class SubmitBox extends React.Component<Props, {}> {
  input: HTMLInputElement;

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    const query = this.input.value;

    const {addSongStore} = this.props;
    addSongStore!.showAddSongScreen(query);

    this.input.value = '';
  }

  render() {
    return (
      <form className="submit-box" onSubmit={(e) => this.handleSubmit(e)}>
        <input type="text" ref={(el) => this.input = el} />
        <button type="submit">is my shit</button>
      </form>
    );
  }
}

export default SubmitBox;