import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import UserStore from '../stores/UserStore';

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
})) @observer
class LoadUserWrapper extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.userStore!.logIn();
  }

  renderLoaded() {
    // TODO: why does typescript hate this
    return this.props.children as JSX.Element;
  }

  renderLoading() {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  render() {
    const {loadedUser} = this.props.userStore!;

    return loadedUser ? this.renderLoaded() : this.renderLoading();
  }
}

export default LoadUserWrapper;