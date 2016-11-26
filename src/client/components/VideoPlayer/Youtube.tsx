// AFAIK this is the only way to import the youtube API type defs
/// <reference types="youtube" />

import * as React from 'react';
import {findDOMNode} from 'react-dom';
import * as queryString from 'query-string';

interface Props {
  url: string;
  playing: boolean;
}

class VideoPlayer extends React.Component<Props, {}> {
  player: YT.Player;

  componentDidMount() {
    const tub = findDOMNode(this) as HTMLElement;

    this.player = new YT.Player(tub, {
      width: '250',
      height: '250',
      videoId: this.getVideoId(this.props.url),

      events: {
        onReady: (e) => this.onPlayerReady(e),
      }
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.player) {
      // If the player hasn't loaded yet, don't try to change anything
      return;
    }

    if (nextProps.url !== this.props.url) {
      const id = this.getVideoId(nextProps.url);
      this.player.loadVideoById(id);
    }

    if (nextProps.playing !== this.props.playing) {
      if (nextProps.url !== this.props.url) {
        // If we're about to change to a new song (& new iframe content), don't toggle playback.
        // The new iframe will cause the YouTube player onReady() event to refire, so we'll start
        // playing in the onPlayerReady() hook
        return;
      }

      if (!nextProps.playing) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    }
  }

  onPlayerReady(evt: YT.EventArgs) {
    if (this.props.playing) {
      this.player.playVideo();
    }
  }

  getVideoId(url: string): string {
    const qs = queryString.parse(queryString.extract(url));
    return qs['v'] as string;
  }

  render() {
    return (
      <div />
    );
  }
}

export default VideoPlayer;