import {observable, action} from 'mobx';
import {getAuthToken} from '../util/authToken';
import {CurrentUser, PublicUser, ColorScheme} from '../../universal/resources';
import {defaultColorScheme} from '../../universal/constants';

import signOut from '../api/signOut';
import followUser from '../api/followUser';
import unfollowUser from '../api/unfollowUser';
import changeColorScheme from '../api/changeColorScheme';

export default class UserStore {
  @observable loggedIn: boolean = false;
  @observable name: string | null = null;
  @observable userId: number | null = null;
  @observable following: PublicUser[] = [];
  @observable _colorScheme: ColorScheme | null = null;

  // TODO: Move me to entry.tsx
  // constructor() {
  //   const pageData = (window as any).__PAGE_DATA__ || {};
  //   const user: CurrentUser | undefined = pageData.currentUser;

  //   if (user) {
  //     this.loadUser(user);
  //   }
  // }

  loadUser(user: CurrentUser) {
    this.loggedIn = true;
    this.name = user.name;
    this.following = user.following;
    this.userId = user.id;
    this._colorScheme = user.colorScheme;
  }

  get colorScheme() {
    if (!this._colorScheme) {
      return defaultColorScheme;
    }

    return this._colorScheme;
  }

  async signOut() {
    await signOut();
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
    this._colorScheme = colorScheme;
  }
}
