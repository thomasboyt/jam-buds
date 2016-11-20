import {observable, action} from 'mobx';
import getPlaylist from '../api/getPlaylist';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaylistStore {
  @observable items: PlaylistEntry[] = [];

  @action async getPlaylist(name: string) {
    this.items = await getPlaylist(name);
  }
}
