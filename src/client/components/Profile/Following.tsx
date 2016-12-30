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
class Following extends React.Component<Props, {}> {
  render() {
    const {profileStore} = this.props;

    return (
      <ProfileWrapper title={`@${profileStore!.name}'s followed users`}>
        <Loader startLoading={() => profileStore!.getFollowing()}
          request={profileStore!.followingRequest}>
          {() => <UsersList users={profileStore!.following} />}
        </Loader>
      </ProfileWrapper>
    );
  }
}

export default Following;