import * as React from 'react';
import {Link} from 'react-router';
import {observer, inject} from 'mobx-react';

import {AUTH_TOKEN_KEY} from '../constants';
import UserStore from '../stores/UserStore';

import TwitterAuth from './TwitterAuth';
import SubmitBox from './SubmitBox';
import AddSongModal from './AddSongModal';
import LoadUserWrapper from './LoadUserWrapper';

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
class App extends React.Component<Props, {}> {
  render() {
    const {loggedIn} = this.props.userStore!;

    return (
      <div className="app-container">
        <div className="top-container">
          <header>
            <h1><Link to="/">jam buds!</Link></h1>
          </header>

          {loggedIn ? <SubmitBox /> : null}
        </div>

        <LoadUserWrapper>
          {this.props.children}
        </LoadUserWrapper>

        {loggedIn ? <AddSongModal /> : null}
      </div>
    );
  }
}

export default App;