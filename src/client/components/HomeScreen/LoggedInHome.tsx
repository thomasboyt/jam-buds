import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';

import FeedStore from '../../stores/FeedStore';
import PlaybackStore from '../../stores/PlaybackStore';
import PlaylistEntry from '../../stores/PlaylistEntry';
import UserStore from '../../stores/UserStore';

import PlaylistItem from '../PlaylistItem';
import SidebarWrapper from '../SidebarWrapper';

import {distanceInWords} from 'date-fns';

interface Props {
  feedStore?: FeedStore;
  playbackStore?: PlaybackStore;
  userStore?: UserStore;
}

// some day this is going to be a cool feed thingy...
@inject((allStores) => ({
  feedStore: allStores.feedStore,
  playbackStore: allStores.playbackStore,
  userStore: allStores.userStore,
})) @observer
class LoggedInHome extends React.Component<Props, {}> {
  handleSongClick(trackIndex: number) {
    const tracks = this.props.feedStore!.items.slice(trackIndex).map((entry) => entry);

    this.props.playbackStore!.playFeedItems(tracks);
  }

  renderLoaded(items: PlaylistEntry[]) {
    if (items.length === 0) {
      return (
        <div className="main-placeholder">
          Your feed doesn't have any entries yet! <Link to="/find-friends">Find some friends to follow!</Link>
        </div>
      );
    }

    return (
      <ul className="playlist-entries">
        {items.map((item, idx) => this.renderItem(item, idx))}
      </ul>
    );
  }

  renderItem(entry: PlaylistEntry, idx: number) {
    const playingTrack = this.props.playbackStore!.nowPlaying;
    const timestamp = distanceInWords(new Date(), new Date(entry.added));

    const displayName = entry.user.id === this.props.userStore!.userId ? 'You' : `@${entry.user.twitterName}`;

    return (
      <li key={entry.id}>
        <div className="posted-by">
          <Link to={`/playlist/${entry.user.twitterName}`}>
            {displayName}
          </Link>
          {' '} posted ({timestamp} ago)
        </div>

        <PlaylistItem
          track={entry} trackIndex={idx}
          isPlaying={(!!playingTrack && playingTrack.id === entry.id)}
          onClick={() => this.handleSongClick(idx)} />
      </li>
    );
  }

  render() {
    const {items, feedPromise} = this.props.feedStore!;

    return (
      <SidebarWrapper>
        <div className="playlist">
          <h2>your feed</h2>

          {feedPromise.case({
            pending: () => <div className="main-placeholder">Loading...</div>,
            rejected: () => <div className="main-placeholder">Error loading!</div>,
            fulfilled: () => this.renderLoaded(items),
          })}
        </div>
      </SidebarWrapper>
    );
  }
}

export default LoggedInHome;