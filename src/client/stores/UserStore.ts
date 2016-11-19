import {observable, action} from 'mobx';
import getCurrentUser from '../api/getCurrentUser';
import {AUTH_TOKEN_KEY} from '../constants';

export default class UserStore {
  @observable loadedUser: boolean = false;
  @observable loggedIn: boolean = false;
  @observable name: string | null = null;

  @action async logIn() {
    this.loadedUser = false;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      const user = await getCurrentUser();

      if (user) {
        this.loggedIn = true;
        this.name = user.name;
      }
    }

    this.loadedUser = true;
  }
}
