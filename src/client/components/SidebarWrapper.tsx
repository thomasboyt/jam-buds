import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import {AUTH_TOKEN_KEY} from '../constants';
import UserStore from '../stores/UserStore';

import TwitterAuth from './TwitterAuth';
import VideoPlayer from './VideoPlayer';

function signOut() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.location.href = '/';
}

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
})) @observer
class SidebarWrapper extends React.Component<Props, {}> {
  renderSidebar() {
    const {name, loggedIn} = this.props.userStore!;

    if (!loggedIn) {
      return null;
    }

    return (
      <div className="sidebar">
        <p>what up, <Link to={`/playlist/${name}`}>{name}</Link></p>

        <p>hey, post a song! paste a link here and get goin'</p>

        <p>or <a href="#" onClick={signOut}>sign out</a></p>

        <VideoPlayer />
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        {this.renderSidebar()}

        <div className="main">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default SidebarWrapper;