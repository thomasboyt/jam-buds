// AFAIK this is the only way to import the youtube API type defs
/// <reference types="youtube" />

import * as React from 'react';
import {findDOMNode} from 'react-dom';
import * as queryString from 'query-string';

interface Props {
  url: string;
  playing: boolean;
  onEnded: () => void;
}

// yes this is a singleton
// no idgaf
let ytPlayer: YT.Player | null = null;
let ytPlayerReady = false;

function setupYoutube() {
  if (typeof YT === 'undefined') {
    // hello server-side rendering~
    return;
  }

  if (!YT.Player && !(window as any).onYoutubeIframeAPIReady) {
    // wait for youtube to load and try again
    (window as any).onYoutubeIframeAPIReady = () => {
      setupYoutube();
    };
    return;
  }

  const tub = document.createElement('div');
  document.body.appendChild(tub);

  ytPlayer = new YT.Player(tub, {
    width: '0',
    height: '0',

    playerVars: {
      playsinline: '1',
    } as any,

    events: {
      onReady: (e) => ytPlayerReady = true,
    },
  });
}

setupYoutube();

export default class Youtube extends React.Component<Props, {}> {
  componentDidMount() {
    if (!ytPlayer || !ytPlayerReady) {
      // TODO: Handle Youtube player not being loaded yet!!
      throw new Error('no player present');
    }

    const id = this.getVideoId(this.props.url);
    ytPlayer.loadVideoById(id);

    if (this.props.playing) {
      ytPlayer.playVideo();
    }

    ytPlayer.addEventListener('onStateChange', this.onStateChange);
  }

  componentWillUnmount() {
    if (!ytPlayer) {
      return;
    }

    ytPlayer.stopVideo();
    (ytPlayer as any).removeEventListener('onStateChange', this.onStateChange);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!ytPlayer) {
      // If the player hasn't loaded yet, don't try to change anything
      return;
    }

    if (nextProps.url !== this.props.url) {
      const id = this.getVideoId(nextProps.url);
      ytPlayer.loadVideoById(id);
    }

    if (nextProps.playing !== this.props.playing) {
      if (nextProps.url !== this.props.url) {
        // If we're about to change to a new song (& new iframe content), don't toggle playback.
        // The new iframe will cause the YouTube player onReady() event to refire, so we'll start
        // playing in the onPlayerReady() hook
        return;
      }

      if (!nextProps.playing) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    }
  }

  onStateChange = (evt: YT.EventArgs) => {
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