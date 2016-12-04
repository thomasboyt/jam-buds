import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';
import * as classNames from 'classnames';

import PlaybackStore from '../../stores/PlaybackStore';
import {PlaylistEntry} from '../../../universal/resources';
import serializeSongLabel from '../../util/serializeSongLabel';

import Youtube from './Youtube';

interface Props {
  playbackStore?: PlaybackStore;
}

function getLabel(song: PlaylistEntry | null): string {
  if (!song) {
    return 'Nothing playing...';
  }

  return `${song.artists.join(',')} - ${song.title}`;
}

function getArt(song: PlaylistEntry | null): string {
  if (!song) {
    // TODO: add placeholder art here
    return '';
  }

  return song.albumArt;
}

@inject((allStores) => ({
  playbackStore: allStores.playbackStore as PlaybackStore,
})) @observer
export default class VideoPlayer extends React.Component<Props, {}> {
  handlePlayPauseClick() {
    this.props.playbackStore!.togglePlayback();
  }

  handleNextClick() {
    this.props.playbackStore!.nextSong();
  }

  handleSongEnd() {
    this.props.playbackStore!.nextSong();
  }

  render() {
    const {nowPlaying, isPlaying, playlistUser} = this.props.playbackStore!;
    const url = nowPlaying ? nowPlaying.youtubeUrl : null;
    const songLabel = getLabel(nowPlaying);
    const art = getArt(nowPlaying);

    const playPauseClassName = classNames('fa', {
      'fa-play': !isPlaying,
      'fa-pause': isPlaying,
    });

    return (
      <div className="audio-player">
        <Youtube url={url} playing={isPlaying} onEnded={() => this.handleSongEnd()} />

        <div className="audio-player--controls">
          <button className="play-pause-button" onClick={() => this.handlePlayPauseClick()}
            disabled={!nowPlaying}>
            <span className={playPauseClassName} />
          </button>

          <button className="next-button" onClick={() => this.handleNextClick()}
            disabled={!nowPlaying}>
            <span className="fa fa-step-forward" />
          </button>
        </div>

        <div className="audio-player--main">
          <span className="song-label">{songLabel}</span>

          {playlistUser &&
            <div>playing from <Link to={`/playlists/${playlistUser}`}>@{playlistUser}</Link></div>}
        </div>

        <img className="audio-player--art" src={art} />
      </div>
    );
  }
}