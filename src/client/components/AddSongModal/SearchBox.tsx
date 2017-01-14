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

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    const query = this.input.value;

    const {addSongStore} = this.props;
    addSongStore!.search(query);
  }

  render() {
    return (
      <form className="submit-box" onSubmit={(e) => this.handleSubmit(e)}>
        <div className="input-container">
          <input type="text" ref={(el) => this.input = el} data-test="song-search-field" />
        </div>

        <button type="submit">find</button>
      </form>
    );
  }
}

export default SearchBox;