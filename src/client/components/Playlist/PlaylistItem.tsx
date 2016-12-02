import * as React from 'react';
import {inject, observer} from 'mobx-react';
import PlaylistStore from '../../stores/PlaylistStore';
import PlaybackStore from '../../stores/PlaybackStore';
import {PlaylistEntry} from '../../../universal/resources';
import * as classNames from 'classnames';

interface Props {
  playlistStore?: PlaylistStore;
  playbackStore?: PlaybackStore;
  track: PlaylistEntry;
}

@inject((allStores) => ({
  playlistStore: allStores.playlistStore as PlaylistStore,
  playbackStore: allStores.playbackStore as PlaybackStore,
})) @observer
export default class PlaylistItem extends React.Component<Props, {}> {
  handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();

    const {track} = this.props;
    this.props.playbackStore!.playSong(track);
  }

  render() {
    const {track, playbackStore} = this.props;

    const playingTrack = playbackStore!.nowPlaying;
    const isPlaying = (!!playingTrack) && playingTrack.id === track.id;

    const className = classNames('playlist-entry', {
      'is-playing': isPlaying,
    });

    return (
      <li className={className}>
        <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer"
          onClick={(e) => this.handleClick(e)}>
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