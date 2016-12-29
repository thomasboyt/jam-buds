import {observable, action} from 'mobx';
import {getAuthToken} from '../util/authToken';
import {PublicUser} from '../../universal/resources';

import getCurrentUser from '../api/getCurrentUser';
import followUser from '../api/followUser';
import unfollowUser from '../api/unfollowUser';

export default class UserStore {
  @observable loadedUser: boolean = false;
  @observable loggedIn: boolean = false;
  @observable name: string | null = null;
  @observable userId: number | null = null;
  @observable following: PublicUser[] = [];

  @action async logIn() {
    this.loadedUser = false;
    const token = getAuthToken();

    if (token) {
      const user = await getCurrentUser();

      if (user) {
        this.loggedIn = true;
        this.name = user.name;
        this.following = user.following;
        this.userId = user.id;
      }
    }

    this.loadedUser = true;
  }

  @action async followUser(userId: number) {
    const user = await followUser(userId);
    this.following.push(user);
  }

  @action async unfollowUser(userId: number) {
    await unfollowUser(userId);
    this.following = this.following.filter((user) => user.id !== userId);
  }

  isFollowing(userId: number): boolean {
    return this.following.find((user) => user.id === userId) ? true : false;
  }
}
