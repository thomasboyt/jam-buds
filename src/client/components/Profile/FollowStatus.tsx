import * as React from 'react';
import {observer, inject} from 'mobx-react';

import UserStore from '../../stores/UserStore';

interface Props {
  userStore?: UserStore;
  isFollowing: boolean;
  userId: number;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer
class FollowStatus extends React.Component<Props, {}> {
  handleFollow() {
    const {userId} = this.props;

    this.props.userStore!.followUser(userId);
  }

  handleUnfollow() {
    const {userId} = this.props;

    this.props.userStore!.unfollowUser(userId);
  }

  render() {
    if (!this.props.userStore!.loggedIn) {
      return null;
    }

    if (this.props.userId === this.props.userStore!.userId) {
      return null;
    }

    if (this.props.isFollowing) {
      return (
        <button className="follow-toggle -is-following" aria-label="Unfollow" onClick={() => this.handleUnfollow()}>
          <span>Following</span>
        </button>
      );

    } else {
      return (
        <button className="follow-toggle" onClick={() => this.handleFollow()}>
          + Follow
        </button>
      );
    }
  }
}

export default FollowStatus;