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

  renderPlaybackSource() {
    const {fromFeed, playlistUser, nowPlaying} = this.props.playbackStore!;

    if (!nowPlaying) {
      return null;
    }

    let source;
    if (fromFeed) {
      source = <Link to="/">your feed</Link>;
    } else {
      source = <Link to={`/playlist/${playlistUser}`}>@{playlistUser}</Link>;
    }

    return (
      <div>playing from {source}</div>
    );
  }

  render() {
    const {nowPlaying, isPlaying, playlistUser} = this.props.playbackStore!;

    const url = nowPlaying ? nowPlaying.youtubeUrl : null;
    const art = nowPlaying ? nowPlaying.song.albumArt : null;
    const artist = nowPlaying ? nowPlaying.song.artists.join(', ') : null;
    const title = nowPlaying ? nowPlaying.song.title : '(nothing playing)';

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
          <div>{title}</div>
          <div>{artist}</div>

          {this.renderPlaybackSource()}
        </div>

        {art && <img className="audio-player--art" src={art} />}
      </div>
    );
  }
}