import * as React from 'react';
import {withRouter, InjectedRouter} from 'react-router';
import {inject, observer} from 'mobx-react';

import {SearchResult} from '../../universal/resources';
import UserStore from '../stores/UserStore';
import addSong from '../api/addSong';

interface Props {
  track: SearchResult;
  router?: InjectedRouter;
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer @withRouter
export default class SearchResultItem extends React.Component<Props, {}> {
  async handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();

    const {track} = this.props;
    await addSong(track.spotifyId);

    const {router} = this.props;
    const {name} = this.props.userStore!;

    router!.push({
      pathname: `/playlist/${name}`,
    });
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