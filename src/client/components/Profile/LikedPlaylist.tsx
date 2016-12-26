import * as React from 'react';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';

import Playlist from '../Playlist';

interface Props {
  profileStore?: ProfileStore;
  params: any;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
})) @observer
class ProfileLikedPlaylist extends React.Component<Props, {}> {
  componentWillMount() {
    const name: string = this.props.params.name;
    this.props.profileStore!.getLikedPlaylist(name);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.profileStore!.getLikedPlaylist(nextProps.params.name);
    }
  }

  noItemsPlaceholder() {
    return (
      <div className="main-placeholder">
        This user has not liked any songs yet :(
      </div>
    )
  }

  render() {
    return (
      <Playlist
        entryList={this.props.profileStore!.likedEntryList}
        noItemsPlaceholder={this.noItemsPlaceholder} />
    );
  }
}

export default ProfileLikedPlaylist;