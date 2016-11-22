import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import {AUTH_TOKEN_KEY} from '../constants';
import UserStore from '../stores/UserStore';
import AddSongStore from '../stores/AddSongStore';

import TwitterAuth from './TwitterAuth';
import SubmitBox from './SubmitBox';
import AddSongModal from './AddSongModal';

function signOut() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.location.href = '/';
}

interface Props {
  userStore?: UserStore;
  addSongStore?: AddSongStore,
}

@inject((allStores) => ({
  userStore: allStores.userStore,
  addSongStore: allStores.addSongStore,
})) @observer
class App extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.userStore!.logIn();
  }

  renderLoggedIn() {
    const {name} = this.props.userStore!;

    return (
      <div>
        <p>what up, <Link to={`/playlist/${name}`}>{name}</Link></p>

        <p>hey, post a song! paste a link here and get goin'</p>

        <p>or <a href="#" onClick={signOut}>sign out</a></p>
      </div>
    );
  }

  renderLoadedUser() {
    const {loggedIn} = this.props.userStore!;

    return (
      <div className="container">
        <div className="sidebar">
          {loggedIn ? this.renderLoggedIn() : <TwitterAuth />}
        </div>

        <div className="main">
          {this.props.children}
        </div>

        <AddSongModal />
      </div>
    );
  }

  render() {
    const {loadedUser} = this.props.userStore!;

    return (
      <div className="app-container">
        <div className="top-container">
          <header>
            <h1><Link to="/">jam buds!</Link></h1>
          </header>

          <SubmitBox />
        </div>

        {loadedUser ? this.renderLoadedUser() : <div>Loading...</div>}
      </div>
    );
  }
}

export default App;