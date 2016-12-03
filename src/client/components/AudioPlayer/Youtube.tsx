// AFAIK this is the only way to import the youtube API type defs
/// <reference types="youtube" />

import * as React from 'react';
import {findDOMNode} from 'react-dom';
import * as queryString from 'query-string';

interface Props {
  url: string | null;
  playing: boolean;
  onEnded: () => void;
}

export default class Youtube extends React.Component<Props, {}> {
  player: YT.Player;

  componentDidMount() {
    if (!YT.Player && !(window as any).onYoutubeIframeAPIReady) {
      this.waitForYoutubeAPI();
    } else {
      this.setupYoutube();
    }
  }

  waitForYoutubeAPI() {
    (window as any).onYoutubeIframeAPIReady = () => {
      this.setupYoutube();
    };
  }

  setupYoutube() {
    const tub = findDOMNode(this) as HTMLElement;
    const videoId = this.props.url ? this.getVideoId(this.props.url) : undefined;

    this.player = new YT.Player(tub, {
      width: '0',
      height: '0',
      videoId: videoId,

      events: {
        onReady: (e) => this.onPlayerReady(e),
        onStateChange: (e) => this.onStateChange(e),
      }
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.player) {
      // If the player hasn't loaded yet, don't try to change anything
      return;
    }

    if (!nextProps.url) {
      this.player.stopVideo();
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

  onStateChange(evt: YT.EventArgs) {
    if (evt.data === YT.PlayerState.ENDED) {
      // cycle to the next song
      this.props.onEnded();
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