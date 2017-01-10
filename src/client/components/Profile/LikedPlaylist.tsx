import * as React from 'react';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';

import ProfileWrapper from './ProfileWrapper';
import Playlist from '../Playlist';

interface Props {
  profileStore?: ProfileStore;
  params: any;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
})) @observer
class ProfileLikedPlaylist extends React.Component<Props, {}> {
  noItemsPlaceholder() {
    return (
      <div className="main-placeholder">
        This user has not liked any songs yet :(
      </div>
    )
  }

  render() {
    const {name} = this.props.profileStore!;

    const loaderConfig = {
      startLoading: () => this.props.profileStore!.getLikedPlaylist(),
      request: this.props.profileStore!.initialLoadProfileRequest,
    };

    return (
      <ProfileWrapper title={`@${name}'s liked tracks`} loaderConfig={loaderConfig}>
        {() => (
          <Playlist
            entryList={this.props.profileStore!.likedEntryList}
            noItemsPlaceholder={this.noItemsPlaceholder} />
        )}
      </ProfileWrapper>
    );
  }
}

export default ProfileLikedPlaylist;