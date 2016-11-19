import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';
import UserStore from '../stores/UserStore';

import TwitterAuth from './TwitterAuth';
import SubmitBox from './SubmitBox';
import {AUTH_TOKEN_KEY} from '../constants';

function signOut() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.location.href = '/';
}

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore as UserStore,
})) @observer
class App extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.userStore!.logIn();
  }

  renderLoggedIn() {
    const {name} = this.props.userStore!;

    return (
      <div>
        <p>what up, {name}</p>

        <p>hey, post a song! paste a link here and get goin'</p>

        <SubmitBox />

        <p>listen to a friend's tunes</p>

        <ul>
          <li>friend one</li>
          <li>friend two</li>
        </ul>

        <p>or <Link to={`/playlist/${name}`}>check your own</Link></p>

        <p>or <a href="#" onClick={signOut}>sign out</a></p>
      </div>
    );
  }

  renderLoadedUser() {
    const {loggedIn} = this.props.userStore!;

    return (
      <div>
        <div className="sidebar">
          {loggedIn ? this.renderLoggedIn() : <TwitterAuth />}
        </div>

        <div className="playlist">
          {this.props.children}
        </div>
      </div>
    );
  }

  render() {
    const {loadedUser} = this.props.userStore!;

    return (
      <div>
        <h1>jam buds</h1>

        {loadedUser ? this.renderLoadedUser() : <div>Loading...</div>}
      </div>
    );
  }
}

export default App;