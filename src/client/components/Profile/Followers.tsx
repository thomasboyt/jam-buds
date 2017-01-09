import * as React from 'react';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';

import ProfileWrapper from './ProfileWrapper';
import Loader from '../Loader';
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

    return (
      <ProfileWrapper title={`@${profileStore!.name}'s followers`}>
        <Loader startLoading={() => profileStore!.getFollowers()}
          request={profileStore!.followersRequest}>
          {() => <UsersList users={profileStore!.followers} colorScheme={profileStore!.colorScheme} />}
        </Loader>
      </ProfileWrapper>
    );
  }
}

export default Followers;