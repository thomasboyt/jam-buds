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
import ProfileWrapper from './components/Profile';
import ProfilePostPlaylist from './components/Profile/PostPlaylist';
// import ProfileLikedPlaylist from './components/Profile/LikedPlaylist';
import FindFriendsScreen from './components/FindFriendsScreen';

import UserStore from './stores/UserStore';
import AddSongStore from './stores/AddSongStore';
import ProfileStore from './stores/ProfileStore';
import PlaybackStore from './stores/PlaybackStore';
import FeedStore from './stores/FeedStore';
import FindFriendsStore from './stores/FindFriendsStore';

const userStore = new UserStore();
const profileStore = new ProfileStore();
const playbackStore = new PlaybackStore();
const feedStore = new FeedStore();
const findFriendsStore = new FindFriendsStore();
const addSongStore = new AddSongStore(feedStore, profileStore);

const stores = {
  userStore, addSongStore, profileStore, playbackStore, feedStore, findFriendsStore,
};

render((
  <Provider {...stores}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeScreen} />

        <Route path="/users/:name" component={ProfileWrapper}>
          <IndexRoute component={ProfilePostPlaylist} />
          {/*<Route path="/liked" component={ProfileLikedPlaylist} />*/}
        </Route>

        <Route path="/find-friends" component={FindFriendsScreen} />
      </Route>
    </Router>
  </Provider>
), document.querySelector('.react-root'));