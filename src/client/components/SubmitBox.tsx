import * as React from 'react';
import {observer, inject} from 'mobx-react';

import AddSongStore from '../stores/AddSongStore';
import getSongsSearch from '../api/getSongsSearch';

import * as classNames from 'classnames';

interface Props {
  addSongStore?: AddSongStore
}

const YOUTUBE_RE = /https:\/\/www\.youtube\.com\/watch\?v=(.*)/;

function validYoutubeAddress(url: string): boolean {
  return YOUTUBE_RE.test(url);
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore
})) @observer
class SubmitBox extends React.Component<Props, {}> {
  input: HTMLInputElement;

  state = {
    value: '',
    invalid: false,
  };

  handleChange(e: React.SyntheticEvent<HTMLInputElement>) {
    this.setState({
      value: e.currentTarget.value,
      invalid: false,
    });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    const url = this.state.value;

    if (!validYoutubeAddress(url)) {
      this.setState({
        invalid: true,
      });

      return;
    }

    const {addSongStore} = this.props;
    addSongStore!.showAddSongScreen(url);

    this.setState({
      value: '',
    });
  }

  render() {
    const {invalid} = this.state;
    const inputClassName = classNames({
      invalid,
    });

    const buttonDisabled = this.state.value === '' || this.state.invalid;

    return (
      <form className="submit-box" onSubmit={(e) => this.handleSubmit(e)}>

        <div className="input-container">
          <input type="text"
            className={inputClassName}
            onChange={(e) => this.handleChange(e)}
            value={this.state.value}
            placeholder="Paste a Youtube link here!!" />
        </div>

        <button type="submit" disabled={buttonDisabled} className={inputClassName}>
          <span>is my shit</span>
        </button>
      </form>
    );
  }
}

export default SubmitBox;