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
class ProfilePostsPlaylist extends React.Component<Props, {}> {
  componentWillMount() {
    const name: string = this.props.params.name;
    this.props.profileStore!.setUser(name);
    this.props.profileStore!.getPlaylist();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.profileStore!.setUser(name);
      this.props.profileStore!.getPlaylist();
    }
  }

  noItemsPlaceholder() {
    return (
      <div className="main-placeholder">
        This user has not posted any songs yet :(
      </div>
    )
  }

  render() {
    const {name} = this.props.profileStore!;

    return (
      <ProfileWrapper title={`@${name}'s playlist`}>
        <Playlist
          entryList={this.props.profileStore!.entryList}
          noItemsPlaceholder={this.noItemsPlaceholder} />
      </ProfileWrapper>
    );
  }
}

export default ProfilePostsPlaylist;