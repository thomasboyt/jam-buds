import * as React from 'react';
import {observer, inject} from 'mobx-react';

import AddSongStore from '../../stores/AddSongStore';

interface Props {
  addSongStore?: AddSongStore
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore
})) @observer
class SearchBox extends React.Component<Props, {}> {
  input: HTMLInputElement;

  handleSubmit(e: React.MouseEvent<any>) {
    e.preventDefault();

    const query = this.input.value;

    const {addSongStore} = this.props;
    addSongStore!.search(query);
  }

  render() {
    return (
      <div>
        <input type="text" ref={(el) => this.input = el} />
        <button onClick={(e) => this.handleSubmit(e)}>find</button>
      </div>
    );
  }
}

export default SearchBox;