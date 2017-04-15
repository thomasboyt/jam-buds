import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import UserStore from '../stores/UserStore';
import UIStore from '../stores/UIStore';

import TwitterAuth from './TwitterAuth';
import AudioPlayer from './AudioPlayer';
import AddSongModal from './AddSongModal';

import Icon from './Icon';
const menuIcon = require('../../../assets/menu.svg');

interface Props {
  userStore?: UserStore;
  uiStore?: UIStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
  uiStore: allStores.uiStore,
})) @observer
class App extends React.Component<Props, {}> {
  handleToggleSidebar() {
    this.props.uiStore!.toggleSidebar();
  }

  renderSidebarToggle() {
    const {loggedIn} = this.props.userStore!;

    if (!loggedIn) {
      return null;
    }

    return (
      <button className="sidebar-toggle" onClick={() => this.handleToggleSidebar()}>
        <Icon glyph={menuIcon} />
      </button>
    );
  }

  render() {
    const {loggedIn} = this.props.userStore!;

    return (
      <div className="app-container">
        <div className="site-header">
          <div className="header-content">
            {this.renderSidebarToggle()}

            <div className="header-logo">
              <h1>
                <Link to="/">jam buds!</Link>
              </h1>
            </div>

            <AudioPlayer />
          </div>
        </div>

        <div className="page-container">
          {this.props.children}
        </div>

        {loggedIn ? <AddSongModal /> : null}
      </div>
    );
  }
}

export default App;