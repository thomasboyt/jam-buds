require('../../styles/main.scss');

import 'whatwg-fetch';
import './twitterAuthHandler';
import './registerSentry';

import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';

import App from './components/App';
import HomeScreen from './components/HomeScreen';
import Playlist from './components/Playlist';
import FindFriendsScreen from './components/FindFriendsScreen';

import UserStore from './stores/UserStore';
import AddSongStore from './stores/AddSongStore';
import PlaylistStore from './stores/PlaylistStore';
import PlaybackStore from './stores/PlaybackStore';
import FeedStore from './stores/FeedStore';
import FindFriendsStore from './stores/FindFriendsStore';

const stores = {
  userStore: new UserStore(),
  addSongStore: new AddSongStore(),
  playlistStore: new PlaylistStore(),
  playbackStore: new PlaybackStore(),
  feedStore: new FeedStore(),
  findFriendsStore: new FindFriendsStore(),
};

render((
  <Provider {...stores}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeScreen} />
        <Route path="/playlist/:name" component={Playlist} />
        <Route path="/find-friends" component={FindFriendsScreen} />
      </Route>
    </Router>
  </Provider>
), document.querySelector('.react-root'));