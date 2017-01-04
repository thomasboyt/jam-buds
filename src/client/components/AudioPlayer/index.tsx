import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';
import * as classNames from 'classnames';

import PlaybackStore from '../../stores/PlaybackStore';
import {PlaylistEntry} from '../../../universal/resources';
import serializeSongLabel from '../../util/serializeSongLabel';

import Youtube from './Youtube';
import Icon from '../Icon';

const playIcon = require('../../../../assets/play.svg');
const pauseIcon = require('../../../../assets/pause.svg');
const nextIcon = require('../../../../assets/next.svg');
const albumPlaceholderIcon = require('../../../../assets/record.svg');

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
    const {playbackSourcePath, playbackSourceLabel, nowPlaying} = this.props.playbackStore!;

    if (!nowPlaying) {
      return null;
    }

    return (
      <div>playing from <Link to={playbackSourcePath}>{playbackSourceLabel}</Link></div>
    );
  }

  renderArt() {
    const {nowPlaying} = this.props.playbackStore!;

    let art = null;

    if (nowPlaying && nowPlaying.song.albumArt) {
      art = nowPlaying.song.albumArt;
    }

    if (art) {
      return <img className="audio-player--art" src={art} />;
    } else {
      return <Icon className="audio-player--art -placeholder" glyph={albumPlaceholderIcon} />;
    }
  }

  render() {
    const {nowPlaying, isPlaying} = this.props.playbackStore!;

    const url = nowPlaying ? nowPlaying.youtubeUrl : null;
    const artist = nowPlaying ? nowPlaying.song.artists.join(', ') : null;
    const title = nowPlaying ? nowPlaying.song.title : '(nothing playing)';

    const playPauseIcon = isPlaying ? pauseIcon : playIcon;

    return (
      <div className="audio-player">
        <Youtube url={url} playing={isPlaying} onEnded={() => this.handleSongEnd()} />

        <div className="audio-player--controls">
          <button className="play-pause-button" onClick={() => this.handlePlayPauseClick()}
            disabled={!nowPlaying}>
            <Icon glyph={playPauseIcon} />
          </button>

          <button className="next-button" onClick={() => this.handleNextClick()}
            disabled={!nowPlaying}>
            <Icon glyph={nextIcon} />
          </button>
        </div>

        <div className="audio-player--main">
          <div>{title}</div>
          <div>{artist}</div>

          {this.renderPlaybackSource()}
        </div>

        {this.renderArt()}
      </div>
    );
  }
}