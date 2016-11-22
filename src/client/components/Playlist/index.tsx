import * as React from 'react';
import {observer, inject} from 'mobx-react';

import PlaylistStore from '../../stores/PlaylistStore';
import UserStore from '../../stores/UserStore';

import PlaylistItem from './PlaylistItem';
import FollowStatus from './FollowStatus';

interface Props {
  playlistStore?: PlaylistStore;
  userStore?: UserStore;
  params: any;
}

@inject((allStores) => ({
  playlistStore: allStores.playlistStore as PlaylistStore,
  userStore: allStores.userStore as UserStore,
})) @observer
class Playlist extends React.Component<Props, {}> {
  componentWillMount() {
    const name: string = this.props.params.name;
    this.props.playlistStore!.getPlaylist(name);
  }

  render() {
    const {items, name, userId} = this.props.playlistStore!;
    const isFollowing = this.props.userStore!.isFollowing(userId);

    return (
      <div>
        <h2>@{name}'s playlist</h2>

        <FollowStatus userId={userId} isFollowing={isFollowing} />

        <ul>
          {items.map((track) => <PlaylistItem key={track.id} track={track} />)}
        </ul>
      </div>
    );
  }
}

export default Playlist;