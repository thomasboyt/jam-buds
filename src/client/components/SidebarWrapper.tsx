import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';
import * as classNames from 'classnames';

import {removeAuthToken} from '../util/authToken';
import UserStore from '../stores/UserStore';
import UIStore from '../stores/UIStore';

import TwitterAuth from './TwitterAuth';
import AddSongButton from './AddSongButton';
import ColorSchemeProvider from './ColorSchemeProvider';

import {ColorScheme} from '../../universal/resources';

function signOut() {
  removeAuthToken();
  document.location.href = '/';
}

interface Props {
  userStore?: UserStore;
  uiStore?: UIStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
  uiStore: allStores.uiStore,
})) @observer
class SidebarWrapper extends React.Component<Props, {}> {
  handleNavLinkClick() {
    this.props.uiStore!.isSidebarOpen = false;
  }

  renderNavLink(path: string, label: string) {
    return (
      <Link to={path} onClick={() => this.handleNavLinkClick()}>{label}</Link>
    );
  }

  renderSidebar() {
    const {name, loggedIn} = this.props.userStore!;

    if (!loggedIn) {
      return null;
    }

    const sidebarClassName = classNames('sidebar', {
      '-open': this.props.uiStore!.isSidebarOpen,
    });

    return (
      <div className={sidebarClassName}>
        <p>what up, {this.renderNavLink(`/users/${name}`, name!)}</p>

        <AddSongButton />

        <ul>
          <li>
            {this.renderNavLink('/', 'your feed')}
          </li>
          <li>
            {this.renderNavLink(`/users/${name}`, 'your playlist')}
          </li>
          <li>
            {this.renderNavLink(`/users/${name}/liked`, 'your liked tracks')}
          </li>
          <li>
            {this.renderNavLink('/find-friends', 'find twitter friends on jam buds!')}
          </li>
          <li>
            {this.renderNavLink('/settings', 'your settings')}
          </li>
          <li>
            {this.renderNavLink('/about', 'about jam buds')}
          </li>
        </ul>

        <p>or <a href="#" onClick={signOut}>sign out</a></p>
      </div>
    );
  }

  handleClickSidebarOverlay() {
    this.props.uiStore!.toggleSidebar();
  }

  renderSidebarOverlay() {
    if (!this.props.uiStore!.isSidebarOpen) {
      return null;
    }

    return (
      <div className="container-overlay" onClick={() => this.handleClickSidebarOverlay()} />
    );
  }

  render() {
    return (
      <div className="container">
        {this.renderSidebar()}
        {this.renderSidebarOverlay()}
        {this.props.children}
      </div>
    );
  }
}

export default SidebarWrapper;