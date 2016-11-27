import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {PlaylistEntry} from '../../universal/resources';
import * as classNames from 'classnames';

interface Props {
  track: PlaylistEntry;
  trackIndex: number;
  isPlaying: boolean;
  onClick: () => void;
}

export default class PlaylistItem extends React.Component<Props, {}> {
  handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.props.onClick();
  }

  render() {
    const {track, isPlaying} = this.props;

    const className = classNames('playlist-entry', {
      'is-playing': isPlaying,
    });

    return (
      <div className={className}>
        <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer"
          onClick={(e) => this.handleClick(e)}>

          <img src={track.albumArt} />

          <span className="title">
            {track.artists.join(', ')}
            <br/>
            {track.title}
          </span>
        </a>
      </div>
    );
  }
}