require('../../styles/main.scss');

import 'whatwg-fetch';
import './twitterAuthHandler';

import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';

import App from './components/App';
import HomeScreenPlaceholder from './components/HomeScreenPlaceholder';
import Playlist from './components/Playlist';
import SearchResults from './components/SearchResults';

import UserStore from './stores/UserStore';
import SearchStore from './stores/SearchStore';

const stores = {
  userStore: new UserStore(),
  searchStore: new SearchStore(),
};

render((
  <Provider {...stores}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeScreenPlaceholder} />
        <Route path="/playlist/:name" component={Playlist} />
        <Route path="/search" component={SearchResults} />
       </Route>
    </Router>
  </Provider>
), document.querySelector('.app-container'));