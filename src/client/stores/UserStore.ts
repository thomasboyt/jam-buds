import {observable, action} from 'mobx';
import {AUTH_TOKEN_KEY} from '../constants';
import {PublicUser} from '../../universal/resources';

import getCurrentUser from '../api/getCurrentUser';
import followUser from '../api/followUser';

export default class UserStore {
  @observable loadedUser: boolean = false;
  @observable loggedIn: boolean = false;
  @observable name: string | null = null;
  @observable userId: number | null = null;
  @observable following: PublicUser[] = [];

  @action async logIn() {
    this.loadedUser = false;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

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

  isFollowing(userId: number): boolean {
    return this.following.find((user) => user.id === userId) ? true : false;
  }
}
