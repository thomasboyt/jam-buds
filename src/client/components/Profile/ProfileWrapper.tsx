import * as React from 'react';
import {Link, withRouter} from 'react-router';
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
  params?: any;
}

@withRouter
@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
  userStore: allStores.userStore as UserStore,
})) @observer
class ProfileWrapper extends React.Component<Props, {}> {
  componentWillMount() {
    this.props.profileStore!.setUser(this.props.params.name);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.profileStore!.setUser(this.props.params.name);
    }
  }

  render() {
    const {name} = this.props.profileStore!;
    const isFollowing = this.props.userStore!.isFollowing(name);

    return (
      <SidebarWrapper>
        <div className="playlist">
          <div className="user-header">
            <div className="user-header-top">
              <h2>
                {this.props.title}
              </h2>

              <FollowStatus name={name} isFollowing={isFollowing} />
            </div>

            <div className="user-links">
              <Link to={`/users/${name}`} activeClassName="active">
                Posts
              </Link>
              {' / '}
              <Link to={`/users/${name}/liked`} activeClassName="active">
                Liked
              </Link>
              {' / '}
              <Link to={`/users/${name}/followers`} activeClassName="active">
                Followers
              </Link>
              {' / '}
              <Link to={`/users/${name}/following`} activeClassName="active">
                Following
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