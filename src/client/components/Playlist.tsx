import * as React from 'react';
import {observer, inject} from 'mobx-react';
import UserStore from '../stores/UserStore';

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer
class Playlist extends React.Component<Props, {}> {
  render() {
    return (
      <div />
    );
  }
}

export default Playlist;