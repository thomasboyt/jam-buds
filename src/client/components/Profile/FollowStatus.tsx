import * as React from 'react';
import {observer, inject} from 'mobx-react';

import UserStore from '../../stores/UserStore';
import {ColorScheme} from '../../../universal/resources';
import withColorScheme from '../withColorScheme';

interface Props {
  userStore?: UserStore;
  isFollowing: boolean;
  name: string;
  colorScheme?: ColorScheme;
}

@withColorScheme
@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer
class FollowStatus extends React.Component<Props, {}> {
  handleFollow() {
    const {name} = this.props;

    this.props.userStore!.followUser(name);
  }

  handleUnfollow() {
    const {name} = this.props;

    this.props.userStore!.unfollowUser(name);
  }

  render() {
    if (!this.props.userStore!.loggedIn) {
      return null;
    }

    if (this.props.name === this.props.userStore!.name) {
      return null;
    }

    const {colorScheme} = this.props;

    const style = {
      backgroundColor: colorScheme!.entryBackgroundColor,
      color: colorScheme!.entryTextColor,
    }

    if (this.props.isFollowing) {
      return (
        <button
          style={style}
          className="follow-toggle -is-following"
          aria-label="Unfollow"
          onClick={() => this.handleUnfollow()}>
          <span>Following</span>
        </button>
      );

    } else {
      return (
        <button
          style={style}
          className="follow-toggle"
          onClick={() => this.handleFollow()}>
          + Follow
        </button>
      );
    }
  }
}

export default FollowStatus;