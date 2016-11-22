import {observable, action} from 'mobx';
import getPlaylist from '../api/getPlaylist';
import {PlaylistEntry} from '../../universal/resources';

export default class PlaylistStore {
  @observable name: string;
  @observable userId: number;

  @observable items: PlaylistEntry[] = [];

  @action async getPlaylist(name: string) {
    this.name = name;
    const playlist = await getPlaylist(name);
    this.items = playlist.tracks;
    this.userId = playlist.user.id;
  }
}
