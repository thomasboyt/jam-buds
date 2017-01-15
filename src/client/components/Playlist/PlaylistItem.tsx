import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';
import * as classNames from 'classnames';

import {distanceInWords} from 'date-fns';

import withColorScheme from '../withColorScheme';
import {ColorScheme} from '../../../universal/resources';
import Icon from '../Icon';

import PlaylistEntry from '../../stores/PlaylistEntry';
import UserStore from '../../stores/UserStore';
import PlaybackStore from '../../stores/PlaybackStore';
import PaginatedPlaylistEntryList from '../../stores/PaginatedPlaylistEntriesList';

const albumPlaceholderIcon = require('../../../../assets/record.svg');
const closeIcon = require('../../../../assets/close.svg');
const arrowIcon = require('../../../../assets/arrow.svg');
const heartOpenIcon = require('../../../../assets/heart_open.svg');
const heartFilledIcon = require('../../../../assets/heart_filled.svg');
const noteIcon = require('../../../../assets/note.svg');

function spotifyUrl(track: PlaylistEntry) {
  return `https://open.spotify.com/track/${track.song.spotifyId}`;
}

interface Props {
  track: PlaylistEntry;
  trackIndex: number;
  entryList: PaginatedPlaylistEntryList;

  userStore?: UserStore;
  playbackStore?: PlaybackStore;
  colorScheme?: ColorScheme;
}

@withColorScheme
@inject((allStores) => ({
  userStore: allStores.userStore,
  playbackStore: allStores.playbackStore,
})) @observer
export default class PlaylistItem extends React.Component<Props, {}> {
  state = {
    isOpen: false,
  };

  handleRequestPlay() {
    const {entryList, trackIndex} = this.props;
    this.props.playbackStore!.playFromList(entryList, trackIndex);
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
          <Icon glyph={heartFilledIcon} /> :
          <Icon glyph={heartOpenIcon} /> }
      </button>
    );
  }

  renderRemoveAction() {
    if (!this.props.userStore!.loggedIn || this.props.track.user.id !== this.props.userStore!.userId) {
      return null;
    }

    return (
      <button onClick={(e) => this.handleDelete(e)}>
        <Icon glyph={closeIcon} />
      </button>
    );
  }

  renderNoteIcon() {
    if (!this.props.track.note) {
      return null;
    }

    return (
      <button onClick={(e) => this.handleOpenNote(e)}>
        <Icon glyph={noteIcon} />
      </button>
    );
  }

  renderToggleOpenAction() {
    const {isOpen} = this.state;

    const className = isOpen ? 'arrow-up' : 'arrow-down';

    return (
      <button onClick={(e) => this.handleToggleOpen(e)} className="drawer-toggle">
        <Icon glyph={arrowIcon} className={className} />
      </button>
    )
  }

  renderPostedBy() {
    const {track, colorScheme} = this.props;

    const timestamp = distanceInWords(new Date(), new Date(track.added));

    const displayName = track.user.id === this.props.userStore!.userId ? 'You' : `@${track.user.twitterName}`;

    return (
      <div className="posted-by">
        <Link to={`/users/${track.user.twitterName}`} style={{color: colorScheme!.linkColor}}>
          {displayName}
        </Link>
        {' '} posted ({timestamp} ago)
      </div>
    );
  }

  renderAlbumArt() {
    const {track} = this.props;

    if (track.song.albumArt) {
      return (
        <img className="playlist-entry--album-art" src={track.song.albumArt} />
      );

    } else {
      return (
        <Icon className="playlist-entry--album-art -placeholder" glyph={albumPlaceholderIcon} />
      );
    }
  }

  renderSources() {
    const {track, colorScheme} = this.props;

    const playbackSourceLink = {
      youtube: (
        <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer"
          style={{color: colorScheme!.entryLinkColor}}>
          Youtube
        </a>
      ),
      bandcamp: (
        <a href={track.bandcampUrl} target="_blank" rel="noopener noreferrer"
          style={{color: colorScheme!.entryLinkColor}}>
          Bandcamp
        </a>
      ),
      soundcloud: (
        <a href={track.soundcloudUrl} target="_blank" rel="noopener noreferrer"
          style={{color: colorScheme!.entryLinkColor}}>
          Soundcloud
        </a>
      )
    }[track.source];

    const spotifyLink = track.song.spotifyId && (
      <span>
        {' / '}
        <a href={spotifyUrl(track)} target="_blank" rel="noopener noreferrer"
          style={{color: colorScheme!.entryLinkColor}}>
          Spotify
        </a>
      </span>
    );

    return (
      <span>
        {playbackSourceLink}
        {spotifyLink}
      </span>
    );
  }

  render() {
    const {track, colorScheme} = this.props;
    const playingTrack = this.props.playbackStore!.nowPlaying;
    const isPlaying = !!playingTrack && playingTrack.id === track.id;

    const className = classNames('playlist-entry', {
      'is-playing': isPlaying,
    });

    const detailClassName = classNames('playlist-entry--detail', {
      'open': this.state.isOpen,
    });

    const entryStyle = {
      backgroundColor: colorScheme!.entryBackgroundColor,
      color: colorScheme!.entryTextColor,
    };

    return (
      <div>
        {this.renderPostedBy()}

        <div className={className} style={entryStyle}>
          <a className="playlist-entry--main"
            href={track.sourceUrl} target="_blank" rel="noopener noreferrer"
            onClick={(e) => this.handleClick(e)}>
            {this.renderAlbumArt()}

            <div className="title">
              <div className="title-content">
                {track.song.artists.join(', ')}
                <br/>
                {track.song.title}
              </div>
            </div>

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
                Listen to this song on:
                {' '}
                {this.renderSources()}
              </em>
            </p>
          </div>
        </div>
      </div>
    );
  }
}