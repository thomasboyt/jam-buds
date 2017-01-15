import {observable, action} from 'mobx';

export default class UIStore {
  @observable isSidebarOpen: boolean = false;

  @action toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}