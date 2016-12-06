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
    const {manualEntry, manualArtist, manualTitle, selectedSong} = this.props.addSongStore!.txn;

    let artist: string;
    let title: string;

    if (manualEntry) {
      artist = manualArtist!;
      title = manualTitle!;
    } else {
      artist = selectedSong!.artists[0];
      title = selectedSong!.name;
    }

    this.props.addSongStore!.updateTweetText(getDefaultTweet(artist, title));
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
      <div className="tweet-box">
        <textarea value={tweetText} onChange={(e) => this.handleChange(e)} />
        ({remainingChars} characters left)
      </div>
    );
  }
}