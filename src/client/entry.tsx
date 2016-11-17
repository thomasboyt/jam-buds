require('../../styles/main.scss');

import 'whatwg-fetch';
import './twitterAuthHandler';

import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';

import {Router, Route, browserHistory} from 'react-router';

import MainScreen from './components/MainScreen';

import UserStore from './stores/UserStore';

const stores = {
  userStore: new UserStore,
};

render((
  <Provider {...stores}>
    <Router history={browserHistory}>
      <Route path="/" component={MainScreen} />
    </Router>
  </Provider>
), document.querySelector('.app-container'));