import * as React from 'react';
import {inject, observer} from 'mobx-react';
import PlaybackStore from '../../stores/PlaybackStore';
import {PlaylistEntry} from '../../../universal/resources';

import Youtube from './Youtube';

interface Props {
  playbackStore?: PlaybackStore;
}

@inject((allStores) => ({
  playbackStore: allStores.playbackStore as PlaybackStore,
})) @observer
export default class PlaylistItem extends React.Component<Props, {}> {
  render() {
    const {nowPlaying} = this.props.playbackStore!;

    if (!nowPlaying) {
      return null;
    }

    return (
      <div className="video-container">
        <Youtube url={nowPlaying.youtubeUrl} playing />
      </div>
    );
  }
}