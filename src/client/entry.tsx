require('../../styles/main.scss');

import 'whatwg-fetch';
import './twitterAuthHandler';

import * as React from 'react';
import {render} from 'react-dom';

import {Router, Route, browserHistory} from 'react-router';
import {Provider} from 'react-redux';

import makeStore from './makeStore';

const store = makeStore(browserHistory);

import MainScreen from './components/MainScreen';

render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={MainScreen} />
    </Router>
  </Provider>
), document.querySelector('.app-container'));