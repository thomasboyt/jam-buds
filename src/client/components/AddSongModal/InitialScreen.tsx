import * as React from 'react';
import {inject, observer} from 'mobx-react';

import SubmitBox from './SubmitBox';

import AddSongStore from '../../stores/AddSongStore';

interface Props {
  addSongStore?: AddSongStore;
}

@inject((allStores) => ({
  addSongStore: allStores.addSongStore as AddSongStore,
})) @observer
export default class InitialScreen extends React.Component<Props, {}> {
  render() {
    return (
      <div>
        <p>Paste a Youtube URL to share in the box below to get started!</p>
        <SubmitBox />
      </div>
    );
  }
}