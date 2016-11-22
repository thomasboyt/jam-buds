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
  async handleFollow(e: React.MouseEvent<any>) {
    e.preventDefault();

    const {userId} = this.props;

    await this.props.userStore!.followUser(userId);
  }

  render() {
    if (this.props.userId === this.props.userStore!.userId) {
      return null;
    }

    if (this.props.isFollowing) {
      return (
        <span>
          Following
        </span>
      );

    } else {
      return (
        <a href="#" onClick={(e) => this.handleFollow(e)}>
          + Follow
        </a>
      );
    }
  }
}

export default FollowStatus;