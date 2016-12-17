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

  handleLike(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.props.track.likeEntry();
  }

  handleUnlike(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.props.track.unlikeEntry();
  }

  renderLikeAction() {
    const {likeRequest, isLiked} = this.props.track;

    if (likeRequest) {
      return likeRequest.case({
        pending: () => <span>Pending...</span>,
        rejected: (err) => <span>Error</span>,
        fulfilled: () => <span />,  // not actually displayed
      });

    } else {
      if (isLiked) {
        return (
          <a href="#" onClick={(e) => this.handleUnlike(e)}>
            Unlike
          </a>
        );
      } else {
        return (
          <a href="#" onClick={(e) => this.handleLike(e)}>
            Like
          </a>
        );
      }
    }
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

          <p>
            {this.renderLikeAction()}
          </p>
        </div>
      </div>
    );
  }
}