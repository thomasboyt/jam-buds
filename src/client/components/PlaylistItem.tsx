import * as React from 'react';
import {observer} from 'mobx-react';
import PlaylistEntry from '../stores/PlaylistEntry';
import * as classNames from 'classnames';

function spotifyUrl(track: PlaylistEntry) {
  return `https://open.spotify.com/track/${track.song.spotifyId}`;
}

interface Props {
  track: PlaylistEntry;
  trackIndex: number;
  isPlaying: boolean;
  onClick: () => void;
}

@observer
export default class PlaylistItem extends React.Component<Props, {}> {
  handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.props.onClick();
  }

  handleToggleLike(e: React.MouseEvent<any>) {
    e.preventDefault();
    e.stopPropagation();

    if (this.props.track.isLiked) {
      this.props.track.unlikeEntry();
    } else {
      this.props.track.likeEntry();
    }
  }

  renderLikeAction() {
    const {likeRequest, isLiked} = this.props.track;

    return (
      <button onClick={(e) => this.handleToggleLike(e)} disabled={!!likeRequest}>
        {isLiked ?
          <span className="fa fa-heart" /> :
          <span className="fa fa-heart-o" />}
      </button>
    );
  }

  render() {
    const {track, isPlaying} = this.props;

    const className = classNames('playlist-entry', {
      'is-playing': isPlaying,
    });

    const detailClassName = classNames('playlist-entry--detail', {
      'open': isPlaying,
    });

    return (
      <div className={className}>
        <a className="playlist-entry--main"
          href={track.youtubeUrl} target="_blank" rel="noopener noreferrer"
          onClick={(e) => this.handleClick(e)}>
          <img src={track.song.albumArt} />

          <span className="title">
            {track.song.artists.join(', ')}
            <br/>
            {track.song.title}
          </span>

          <span className="playlist-entry--actions">
            {this.renderLikeAction()}
          </span>
        </a>

        <div className={detailClassName}>
          {track.note &&
            <p className="track-note">
              {track.note}
            </p>
          }

          <p>
            <em>
              Listen to this song on:{' '}
              <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer">
                Youtube
              </a>
              {track.song.spotifyId &&
                <span>
                  {' / '}
                  <a href={spotifyUrl(track)} target="_blank" rel="noopener noreferrer">
                    Spotify
                  </a>
                </span>
              }
            </em>
          </p>
        </div>
      </div>
    );
  }
}