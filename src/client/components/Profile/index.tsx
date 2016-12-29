import * as React from 'react';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';
import UserStore from '../../stores/UserStore';

import FollowStatus from './FollowStatus';
import SidebarWrapper from '../SidebarWrapper';

import PlaylistEntry from '../../stores/PlaylistEntry';

interface Props {
  profileStore?: ProfileStore;
  userStore?: UserStore;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
  userStore: allStores.userStore as UserStore,
})) @observer
class Playlist extends React.Component<Props, {}> {
  render() {
    const {userId, name} = this.props.profileStore!;
    const isFollowing = this.props.userStore!.isFollowing(userId);

    return (
      <SidebarWrapper>
        <div className="playlist">
          <h2>
            @{name}
            {' '}
            <FollowStatus userId={userId} isFollowing={isFollowing} />
          </h2>
          {this.props.children}
        </div>
      </SidebarWrapper>
    );
  }
}

export default Playlist;