import {observable, action} from 'mobx';
import {getAuthToken} from '../util/authToken';
import {PublicUser, ColorScheme} from '../../universal/resources';

import getCurrentUser from '../api/getCurrentUser';
import followUser from '../api/followUser';
import unfollowUser from '../api/unfollowUser';
import changeColorScheme from '../api/changeColorScheme';

export default class UserStore {
  @observable loadedUser: boolean = false;
  @observable loggedIn: boolean = false;
  @observable name: string | null = null;
  @observable userId: number | null = null;
  @observable following: PublicUser[] = [];
  @observable colorScheme: ColorScheme | null = null;

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
        this.colorScheme = user.colorScheme;
      }
    }

    this.loadedUser = true;
  }

  @action async followUser(userName: string) {
    const user = await followUser(userName);
    this.following.push(user);
  }

  @action async unfollowUser(userName: string) {
    await unfollowUser(userName);
    this.following = this.following.filter((user) => user.twitterName !== userName);
  }

  isFollowing(userName: string): boolean {
    return this.following.find((user) => user.twitterName === userName) ? true : false;
  }

  @action async changeColorScheme(colorScheme: ColorScheme) {
    await changeColorScheme(colorScheme);
    this.colorScheme = colorScheme;
  }
}
