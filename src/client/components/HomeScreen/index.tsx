import * as React from 'react';
import {Link} from 'react-router';
import {inject, observer} from 'mobx-react';

import UserStore from '../../stores/UserStore';

import LoggedInHome from './LoggedInHome';
import LoggedOutHome from './LoggedOutHome';

interface Props {
  userStore?: UserStore;
}

@inject((allStores) => ({
  userStore: allStores.userStore,
})) @observer
class HomeScreen extends React.Component<Props, {}> {
  render() {
    const {loggedIn} = this.props.userStore!;

    return loggedIn ? <LoggedInHome /> : <LoggedOutHome />;
  }
}

export default HomeScreen;