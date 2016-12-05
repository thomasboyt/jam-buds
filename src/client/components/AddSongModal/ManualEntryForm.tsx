import * as React from 'react';
import {inject, observer} from 'mobx-react';

import AddSongStore from '../../stores/AddSongStore';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
export default class ManualEntryForm extends React.Component<Props, {}> {
  state = {
    artist: '',
    title: '',
  }

  handleChange(e: React.SyntheticEvent<HTMLInputElement>) {
    const {name, value} = e.currentTarget;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.addSongStore!.manualEntry(this.state.artist, this.state.title);
  }

  render() {
    const isFilled = this.state.artist !== '' && this.state.title !== '';

    return (
      <form className="submit-box" onSubmit={(e) => this.handleSubmit(e)}>
        <input type="text" placeholder="Artist"
          value={this.state.artist} name="artist"
          onChange={(e) => this.handleChange(e)} />

        <input type="text" placeholder="Title"
          value={this.state.title} name="title"
          onChange={(e) => this.handleChange(e)} />

        <button type="submit" disabled={!isFilled}>
          next
        </button>
      </form>
    );
  }
}