import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import {removeAuthToken} from '../util/authToken';
import UserStore from '../stores/UserStore';

import TwitterAuth from './TwitterAuth';
import AddSongButton from './AddSongButton';

function signOut() {
  removeAuthToken();
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
        </ul>

        <p>or <a href="#" onClick={signOut}>sign out</a></p>
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