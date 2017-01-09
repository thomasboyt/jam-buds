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
class Followers extends React.Component<Props, {}> {
  render() {
    const {profileStore} = this.props;

    const loaderConfig = {
      startLoading: () => profileStore!.getFollowers(),
      request: profileStore!.followersRequest,
    };

    return (
      <ProfileWrapper title={`@${profileStore!.name}'s followers`} loaderConfig={loaderConfig}>
        {() => <UsersList users={profileStore!.followers} />}
      </ProfileWrapper>
    );
  }
}

export default Followers;