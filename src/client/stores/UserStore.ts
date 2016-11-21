import {observable, action} from 'mobx';
import getCurrentUser from '../api/getCurrentUser';
import {AUTH_TOKEN_KEY} from '../constants';
import {PublicUser} from '../../universal/resources';

export default class UserStore {
  @observable loadedUser: boolean = false;
  @observable loggedIn: boolean = false;
  @observable name: string | null = null;
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
      }
    }

    this.loadedUser = true;
  }
}
