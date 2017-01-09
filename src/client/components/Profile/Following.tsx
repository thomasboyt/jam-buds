import * as React from 'react';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';

import ProfileWrapper from './ProfileWrapper';
import UsersList from './UsersList';

interface Props {
  profileStore?: ProfileStore;
  params: any;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
})) @observer
class Following extends React.Component<Props, {}> {
  render() {
    const {profileStore} = this.props;

    const loaderConfig = {
      startLoading: () => profileStore!.getFollowing(),
      request: profileStore!.followingRequest,
    };

    return (
      <ProfileWrapper title={`@${profileStore!.name}'s followed users`} loaderConfig={loaderConfig}>
        {() => <UsersList users={profileStore!.following} />}
      </ProfileWrapper>
    );
  }
}

export default Following;