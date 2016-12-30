import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';
import UserStore from '../../stores/UserStore';

import FollowStatus from './FollowStatus';
import SidebarWrapper from '../SidebarWrapper';

import PlaylistEntry from '../../stores/PlaylistEntry';

interface Props {
  title: string;
  profileStore?: ProfileStore;
  userStore?: UserStore;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
  userStore: allStores.userStore as UserStore,
})) @observer
class ProfileWrapper extends React.Component<Props, {}> {
  render() {
    const {userId, name} = this.props.profileStore!;
    const isFollowing = this.props.userStore!.isFollowing(userId);

    return (
      <SidebarWrapper>
        <div className="playlist">
          <div className="user-header">
            <h2>
              {this.props.title}
            </h2>

            <FollowStatus name={name} isFollowing={isFollowing} />

            <div className="user-links">
              <Link to={`/users/${name}`}>
                Posts
              </Link>
              {' / '}
              <Link to={`/users/${name}/liked`}>
                Liked
              </Link>
            </div>
          </div>

          {this.props.children}
        </div>
      </SidebarWrapper>
    );
  }
}

export default ProfileWrapper;