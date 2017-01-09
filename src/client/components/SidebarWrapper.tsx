import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import {removeAuthToken} from '../util/authToken';
import UserStore from '../stores/UserStore';

import TwitterAuth from './TwitterAuth';
import AddSongButton from './AddSongButton';
import ColorSchemeProvider from './ColorSchemeProvider';
import MainWrapper from './MainWrapper';

import {ColorScheme} from '../../universal/resources';

function signOut() {
  removeAuthToken();
  document.location.href = '/';
}

interface Props {
  userStore?: UserStore;
  colorScheme?: ColorScheme | null;
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
        <p>what up, <Link to={`/users/${name}`}>{name}</Link></p>

        <AddSongButton />

        <ul>
          <li>
            <Link to="/">your feed</Link>
          </li>
          <li>
            <Link to={`/users/${name}`}>your playlist</Link>
          </li>
          <li>
            <Link to={`/users/${name}/liked`}>your liked tracks</Link>
          </li>
          <li>
            <Link to="/find-friends">find twitter friends on jam buds!</Link>
          </li>
          <li>
            <Link to="/settings">your settings</Link>
          </li>
          <li>
            <Link to="/about">about jam buds</Link>
          </li>
        </ul>

        <p>or <a href="#" onClick={signOut}>sign out</a></p>
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        {this.renderSidebar()}

        <ColorSchemeProvider colorScheme={this.props.colorScheme || this.props.userStore!.colorScheme}>
          <MainWrapper>
            {this.props.children}
          </MainWrapper>
        </ColorSchemeProvider>
      </div>
    );
  }
}

export default SidebarWrapper;