import * as React from 'react';
import {Link} from 'react-router';
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
          <div className="user-header">
            <h2>
              @{name}
            </h2>

            <FollowStatus userId={userId} isFollowing={isFollowing} />

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

export default Playlist;