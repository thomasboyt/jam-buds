import * as React from 'react';
import {observer, inject} from 'mobx-react';

import PlaylistEntry from '../stores/PlaylistEntry';
import UserStore from '../stores/UserStore';
import PlaybackStore from '../stores/PlaybackStore';
import PaginatedPlaylistEntryList from '../stores/PaginatedPlaylistEntriesList';

import * as classNames from 'classnames';

function spotifyUrl(track: PlaylistEntry) {
  return `https://open.spotify.com/track/${track.song.spotifyId}`;
}

interface Props {
  track: PlaylistEntry;
  trackIndex: number;
  isPlaying: boolean;
  entryList: PaginatedPlaylistEntryList;
  playbackSourcePath: string;
  playbackSourceName: string;

  userStore?: UserStore;
  playbackStore?: PlaybackStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
  playbackStore: allStores.playbackStore,
})) @observer
export default class PlaylistItem extends React.Component<Props, {}> {
  state = {
    isOpen: false,
  };

  handleRequestPlay() {
    const {entryList, trackIndex, playbackSourcePath, playbackSourceName} = this.props;
    this.props.playbackStore!.playFromList(entryList, trackIndex, playbackSourcePath, playbackSourceName);
  }

  handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.handleRequestPlay();

    this.setState({
      isOpen: true,
    });
  }

  handleDelete(e: React.MouseEvent<any>) {
    e.preventDefault();
    e.stopPropagation();

    // the dream of the 90s is still alive
    const confirmedDelete = window.confirm('Are you sure you want to delete this entry?')

    if (confirmedDelete) {
      this.props.track.deleteEntry();
    }
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

  handleToggleOpen(e: React.MouseEvent<any>) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  handleOpenNote(e: React.MouseEvent<any>) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isOpen: true,
    });
  }

  renderLikeAction() {
    if (!this.props.userStore!.loggedIn) {
      // unauthenticated users can't like songs!
      return null;
    }

    if (this.props.track.user.id === this.props.userStore!.userId) {
      // users can't like their own songs
      return null;
    }

    const {likeRequest, isLiked} = this.props.track;

    return (
      <button onClick={(e) => this.handleToggleLike(e)} disabled={!!likeRequest}>
        {isLiked ?
          <span className="fa fa-heart" /> :
          <span className="fa fa-heart-o" />}
      </button>
    );
  }

  renderRemoveAction() {
    if (!this.props.userStore!.loggedIn || this.props.track.user.id !== this.props.userStore!.userId) {
      return null;
    }

    return (
      <button onClick={(e) => this.handleDelete(e)}>
        <span className="fa fa-times" />
      </button>
    );
  }

  renderNoteIcon() {
    if (!this.props.track.note) {
      return null;
    }

    return (
      <button onClick={(e) => this.handleOpenNote(e)}>
        <span className="fa fa-file-text-o" />
      </button>
    );
  }

  renderToggleOpenAction() {
    const {isOpen} = this.state;

    return (
      <button onClick={(e) => this.handleToggleOpen(e)} className="drawer-toggle">
        {isOpen ?
          <span className="fa fa-angle-up" /> :
          <span className="fa fa-angle-down" />}
      </button>
    )
  }

  render() {
    const {track, isPlaying} = this.props;

    const className = classNames('playlist-entry', {
      'is-playing': isPlaying,
    });

    const detailClassName = classNames('playlist-entry--detail', {
      'open': this.state.isOpen,
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
            {this.renderNoteIcon()}
            {this.renderLikeAction()}
            {this.renderRemoveAction()}
            {this.renderToggleOpenAction()}
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