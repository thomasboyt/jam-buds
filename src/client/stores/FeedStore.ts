import {observable, action} from 'mobx';
import getFeed from '../api/getFeed';
import {FeedEntry} from '../../universal/resources';

export default class FeedStore {
  @observable items: FeedEntry[] = [];

  @action async getFeed() {
    const data = await getFeed();
    this.items = data.tracks;
  }
}
