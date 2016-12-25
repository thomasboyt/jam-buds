import * as React from 'react';
import {observer, inject} from 'mobx-react';

import PlaylistStore from '../../stores/PlaylistStore';
import PlaybackStore from '../../stores/PlaybackStore';
import UserStore from '../../stores/UserStore';

import PlaylistItem from '../PlaylistItem';
import FollowStatus from './FollowStatus';
import SidebarWrapper from '../SidebarWrapper';

import PlaylistEntry from '../../stores/PlaylistEntry';

interface Props {
  playlistStore?: PlaylistStore;
  playbackStore?: PlaybackStore;
  userStore?: UserStore;
  params: any;
}

@inject((allStores) => ({
  playlistStore: allStores.playlistStore as PlaylistStore,
  playbackStore: allStores.playbackStore as PlaybackStore,
  userStore: allStores.userStore as UserStore,
})) @observer
class Playlist extends React.Component<Props, {}> {
  componentWillMount() {
    const name: string = this.props.params.name;
    this.props.playlistStore!.getPlaylist(name);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.playlistStore!.getPlaylist(nextProps.params.name);
    }
  }

  handleSongClick(trackIndex: number) {
    const tracks = this.props.playlistStore!.entryList.items.slice(trackIndex);
    const username = this.props.playlistStore!.name;

    this.props.playbackStore!.playPlaylistItems(tracks, username);
  }

  handleGetNextPage(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.props.playlistStore!.entryList.getNextPage();
  }

  renderItems(items: PlaylistEntry[]) {
    const {userId} = this.props.playlistStore!;
    const playingTrack = this.props.playbackStore!.nowPlaying;

    if (items.length === 0) {
      return (
        <div className="main-placeholder">
          This user hasn't posted any songs yet :(
        </div>
      );
    }

    return (
      <ul className="playlist-entries">
        {items.map((track, idx) =>
          <li key={track.id}>
            <PlaylistItem
              track={track} trackIndex={idx}
              isPlaying={(!!playingTrack && playingTrack.id === track.id)}
              onClick={() => this.handleSongClick(idx)} />
          </li>
        )}
      </ul>
    );
  }

  renderNextPageLoading() {
    const {nextPageRequest, loadedFirstPage, entriesExhausted} = this.props.playlistStore!.entryList;

    if (!nextPageRequest) {
      if (entriesExhausted) {
        return null;
      }

      return (
        <a href="#" onClick={(e) => this.handleGetNextPage(e)}>
          Load next page
        </a>
      );
    }

    let className = '';
    if (!loadedFirstPage) {
      className = 'main-placeholder';
    }

    return nextPageRequest.case({
      pending: () => <div className={className}>Loading...</div>,
      rejected: () => <div className={className}>Error loading!</div>,
      fulfilled: () => <div />,
    });
  }

  render() {
    const {items, nextPageRequest, loadedFirstPage} = this.props.playlistStore!.entryList;
    const {name, userId} = this.props.playlistStore!;
    const isFollowing = this.props.userStore!.isFollowing(userId);

    return (
      <SidebarWrapper>
        <div className="playlist">
          <h2>@{name}'s playlist</h2>
          <FollowStatus userId={userId} isFollowing={isFollowing} />
          {loadedFirstPage && this.renderItems(items)}
          {this.renderNextPageLoading()}
        </div>
      </SidebarWrapper>
    );
  }
}

export default Playlist;