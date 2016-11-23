import * as React from 'react';
import {inject, observer} from 'mobx-react';
import PlaylistStore from '../../stores/PlaylistStore';
import {PlaylistEntry} from '../../../universal/resources';

interface Props {
  playlistStore?: PlaylistStore;
  track: PlaylistEntry;
}

@inject((allStores) => ({
  playlistStore: allStores.playlistStore as PlaylistStore,
})) @observer
export default class PlaylistItem extends React.Component<Props, {}> {
  render() {
    const {track} = this.props;

    return (
      <li className="playlist-entry">
        <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer">
          <img src={track.albumArt} />
          <span className="title">
            {track.artists.join(', ')}
            <br/>
            {track.title}
          </span>
        </a>
      </li>
    );
  }
}