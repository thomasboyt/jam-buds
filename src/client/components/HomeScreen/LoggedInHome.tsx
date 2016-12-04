import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';

import FeedStore from '../../stores/FeedStore';
import PlaybackStore from '../../stores/PlaybackStore';
import {FeedEntry} from '../../../universal/resources';

import PlaylistItem from '../PlaylistItem';

import {distanceInWords} from 'date-fns';

interface Props {
  feedStore?: FeedStore;
  playbackStore?: PlaybackStore;
}

// some day this is going to be a cool feed thingy...
@inject((allStores) => ({
  feedStore: allStores.feedStore,
  playbackStore: allStores.playbackStore,
})) @observer
class LoggedInHome extends React.Component<Props, {}> {
  componentWillMount() {
    this.props.feedStore!.getFeed();
  }

  handleSongClick(trackIndex: number) {
    const tracks = this.props.feedStore!.items.slice(trackIndex).map((entry) => entry.song);

    this.props.playbackStore!.playFeedItems(tracks);
  }

  renderItem(entry: FeedEntry, idx: number) {
    const playingTrack = this.props.playbackStore!.nowPlaying;
    const track = entry.song;
    const timestamp = distanceInWords(new Date(), new Date(entry.song.added));

    return (
      <li key={track.id}>
        <div className="posted-by">
          <Link to={`/playlist/${entry.user.twitterName}`}>
            @{entry.user.twitterName}
          </Link>
          {' '} posted ({timestamp} ago)
        </div>

        <PlaylistItem
          track={track} trackIndex={idx}
          isPlaying={(!!playingTrack && playingTrack.id === track.id)}
          onClick={() => this.handleSongClick(idx)} />
      </li>
    );
  }

  render() {
    const {items} = this.props.feedStore!;

    return (
      <div className="playlist">
        <h2>your feed</h2>

        <ul className="playlist-entries">
          {items.map((item, idx) => this.renderItem(item, idx))}
        </ul>
      </div>
    );
  }
}

export default LoggedInHome;