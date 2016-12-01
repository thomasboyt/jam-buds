import * as React from 'react';
import {inject, observer} from 'mobx-react';

import AddSongStore from '../../stores/AddSongStore';
import {getDefaultTweet} from '../../util/songTweet';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
export default class TwitterShareBox extends React.Component<Props, {}> {
  componentWillMount() {
    const song = this.props.addSongStore!.txn.selectedSong!;
    this.props.addSongStore!.updateTweetText(getDefaultTweet(song));
  }

  handleChange(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;

    this.props.addSongStore!.updateTweetText(value);
  }

  render() {
    const tweetText = this.props.addSongStore!.txn.tweetText!;
    const tweetLength = this.props.addSongStore!.txn.tweetLength;
    const remainingChars = 140 - tweetLength;

    return (
      <div>
        <textarea value={tweetText} onChange={(e) => this.handleChange(e)} />
        ({remainingChars} left)
      </div>
    );
  }
}