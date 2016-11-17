import * as React from 'react';
import {observer, inject} from 'mobx-react';
import UserStore from '../stores/UserStore';

import TwitterAuth from './TwitterAuth';

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer
class MainScreen extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.userStore!.logIn();
  }

  renderLoadedUser() {
    const {loggedIn, name} = this.props.userStore!;

    return (
      <div>
        {!loggedIn && <TwitterAuth />}
        {name && <div>what up, {name}</div>}
      </div>
    )
  }

  render() {
    const {loadedUser} = this.props.userStore!;

    return (
      <div>
        <div>welcome 2 jam buds</div>
        {loadedUser ? this.renderLoadedUser() : <div>Loading...</div>}
      </div>
    );
  }
}

export default MainScreen;