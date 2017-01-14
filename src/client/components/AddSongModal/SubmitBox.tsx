import * as React from 'react';
import {observer, inject} from 'mobx-react';

import AddSongStore from '../../stores/AddSongStore';
import getSongsSearch from '../../api/getSongsSearch';

import * as classNames from 'classnames';
import {getPlaybackSourceForUrl} from '../../../universal/playbackSources';

interface Props {
  addSongStore?: AddSongStore
}

function isValidUrl(url: string): boolean {
  return getPlaybackSourceForUrl(url) !== null;
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

    if (!isValidUrl(url)) {
      this.setState({
        invalid: true,
      });

      return;
    }

    const {addSongStore} = this.props;
    addSongStore!.submitSongLink(url);
  }

  render() {
    const {invalid} = this.state;
    const inputClassName = classNames({
      invalid,
    });
    const buttonClassName = classNames('submit-song', {
      invalid,
    });

    const buttonDisabled = this.state.value === '' || this.state.invalid;

    return (
      <form className="submit-box" onSubmit={(e) => this.handleSubmit(e)}>

        <div className="input-container">
          <input type="text"
            data-test="song-url-field"
            className={inputClassName}
            onChange={(e) => this.handleChange(e)}
            value={this.state.value}
            placeholder="Paste a Youtube link here!!" />
        </div>

        <button type="submit" disabled={buttonDisabled} className={buttonClassName}>
          <span>is my shit</span>
        </button>
      </form>
    );
  }
}

export default SubmitBox;