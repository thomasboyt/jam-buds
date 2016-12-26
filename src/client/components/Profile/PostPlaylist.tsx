import * as React from 'react';
import {observer, inject} from 'mobx-react';

import ProfileStore from '../../stores/ProfileStore';

import Playlist from '../Playlist';

interface Props {
  profileStore?: ProfileStore;
  params: any;
}

@inject((allStores) => ({
  profileStore: allStores.profileStore as ProfileStore,
})) @observer
class ProfilePostsPlaylist extends React.Component<Props, {}> {
  componentWillMount() {
    const name: string = this.props.params.name;
    this.props.profileStore!.getPlaylist(name);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.name !== this.props.params.name) {
      this.props.profileStore!.getPlaylist(nextProps.params.name);
    }
  }

  noItemsPlaceholder() {
    return (
      <div className="main-placeholder">
        This user has not posted any songs yet :(
      </div>
    )
  }

  render() {
    const {items, loadedFirstPage} = this.props.profileStore!.entryList;

    return (
      <Playlist
        entryList={this.props.profileStore!.entryList}
        noItemsPlaceholder={this.noItemsPlaceholder} />
    );
  }
}

export default ProfilePostsPlaylist;