import * as React from 'react';
import {withRouter} from 'react-router';
import Link from '../Link';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';
import UserStore from '../../stores/UserStore';

import FollowStatus from './FollowStatus';
import SidebarWrapper from '../SidebarWrapper';
import {defaultColorScheme} from '../../../universal/constants';

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

  renderLink(url: string, label: string) {
    const colorScheme = this.props.profileStore!.colorScheme || defaultColorScheme;

    return (
      <Link to={url} activeClassName="active" style={{color: colorScheme.linkColor}}>
        {label}
      </Link>
    );
  }

  render() {
    const {name, colorScheme} = this.props.profileStore!;
    const isFollowing = this.props.userStore!.isFollowing(name);

    return (
      <SidebarWrapper colorScheme={colorScheme!}>
        <div className="playlist">
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

          {this.props.children}
        </div>
      </SidebarWrapper>
    );
  }
}

export default ProfileWrapper;