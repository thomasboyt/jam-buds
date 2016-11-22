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

  state = {
    value: '',
  };

  handleChange(e: React.SyntheticEvent<HTMLInputElement>) {
    this.setState({
      value: e.currentTarget.value,
    });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    const query = this.state.value;

    const {addSongStore} = this.props;
    addSongStore!.showAddSongScreen(query);

    this.setState({
      value: '',
    });
  }

  render() {
    return (
      <form className="submit-box" onSubmit={(e) => this.handleSubmit(e)}>
        <div className="input-container">
          <input type="text"
            onChange={(e) => this.handleChange(e)}
            value={this.state.value}
            placeholder="Paste a Youtube link here!!" />
        </div>

        <button type="submit" disabled={this.state.value === ''}>
          <span>is my shit</span>
        </button>
      </form>
    );
  }
}

export default SubmitBox;