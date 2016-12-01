import * as React from 'react';
import {inject, observer} from 'mobx-react';

import {SearchResult} from '../../../universal/resources';
import UserStore from '../../stores/UserStore';
import AddSongStore from '../../stores/AddSongStore';

interface Props {
  track: SearchResult;
  userStore?: UserStore;
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
export default class SearchResultItem extends React.Component<Props, {}> {
  async handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();

    await this.props.addSongStore!.selectSearchResult(this.props.track);
  }

  render() {
    const {track} = this.props;

    return (
      <li>
        <a href="#" onClick={(e) => this.handleClick(e)}>
          {track.artists.join(', ')} - {track.name}
        </a>
      </li>
    );
  }
}