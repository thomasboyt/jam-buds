import * as React from 'react';
import {observer, inject} from 'mobx-react';

import PlaylistStore from '../../stores/PlaylistStore';
import PlaybackStore from '../../stores/PlaybackStore';
import UserStore from '../../stores/UserStore';

import PlaylistItem from '../PlaylistItem';
import FollowStatus from './FollowStatus';
import SidebarWrapper from '../SidebarWrapper';

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
    const tracks = this.props.playlistStore!.items.slice(trackIndex);
    const username = this.props.playlistStore!.name;

    this.props.playbackStore!.playPlaylistItems(tracks, username);
  }

  render() {
    const {items, name, userId} = this.props.playlistStore!;
    const isFollowing = this.props.userStore!.isFollowing(userId);
    const playingTrack = this.props.playbackStore!.nowPlaying;

    return (
      <SidebarWrapper>
        <div className="playlist">
          <h2>@{name}'s playlist</h2>

          <FollowStatus userId={userId} isFollowing={isFollowing} />

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
        </div>
      </SidebarWrapper>
    );
  }
}

export default Playlist;