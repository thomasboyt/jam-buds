import {observable, action} from 'mobx';
import getPlaylist from '../api/getPlaylist';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaylistStore {
  @observable name: string;
  @observable items: PlaylistEntry[] = [];

  @action async getPlaylist(name: string) {
    this.name = name;
    this.items = await getPlaylist(name);
  }
}
