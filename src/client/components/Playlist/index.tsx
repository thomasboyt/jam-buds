import * as React from 'react';
import {observer, inject} from 'mobx-react';
import PlaylistStore from '../../stores/PlaylistStore';
import PlaylistItem from './PlaylistItem';

interface Props {
  playlistStore?: PlaylistStore;
  params: any;
}

@inject((allStores) => ({
  playlistStore: allStores.playlistStore as PlaylistStore,
})) @observer
class Playlist extends React.Component<Props, {}> {
  componentWillMount() {
    const name: string = this.props.params.name;
    this.props.playlistStore!.getPlaylist(name);
  }

  render() {
    const {items, name} = this.props.playlistStore!;

    return (
      <div>
        <h2>@{name}'s playlist</h2>

        <ul>
          {items.map((track) => <PlaylistItem key={track.id} track={track} />)}
        </ul>
      </div>
    );
  }
}

export default Playlist;