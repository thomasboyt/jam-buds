import * as React from 'react';
import Link from '../Link';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';
import UserStore from '../../stores/UserStore';

import FollowStatus from './FollowStatus';

interface Props {
  title: string;
  profileStore?: ProfileStore;
  userStore?: UserStore;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
  userStore: allStores.userStore as UserStore,
})) @observer
export default class ProfileNav extends React.Component<Props, {}> {
  renderLink(url: string, label: string) {
    return (
      <Link to={url} activeClassName="active">
        {label}
      </Link>
    );
  }

  render() {
    const {name} = this.props.profileStore!;
    const isFollowing = this.props.userStore!.isFollowing(name);

    return (
      <div className="user-header">
        <div className="user-header-top">
          <h2>
            {this.props.title}
          </h2>

          <FollowStatus name={name} isFollowing={isFollowing} />
        </div>

        <div className="user-links">
          {this.renderLink(`/users/${name}`, 'Posts')}
          {' / '}
          {this.renderLink(`/users/${name}/liked`, 'Liked')}
          {' / '}
          {this.renderLink(`/users/${name}/followers`, 'Followers')}
          {' / '}
          {this.renderLink(`/users/${name}/following`, 'Following')}
        </div>
      </div>
    );
  }
}