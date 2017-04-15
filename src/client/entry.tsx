require('../../styles/main.scss');

import 'whatwg-fetch';
import './registerSentry';

import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'mobx-react';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';

import App from './components/App';
import HomeScreen from './components/HomeScreen';
import ProfilePostPlaylist from './components/Profile/PostPlaylist';
import ProfileLikedPlaylist from './components/Profile/LikedPlaylist';
import ProfileFollowing from './components/Profile/Following';
import ProfileFollowers from './components/Profile/Followers';
import FindFriendsScreen from './components/FindFriendsScreen';
import AboutScreen from './components/AboutScreen';
import SettingsScreen from './components/SettingsScreen';

import UserStore from './stores/UserStore';
import AddSongStore from './stores/AddSongStore';
import ProfileStore from './stores/ProfileStore';
import PlaybackStore from './stores/PlaybackStore';
import FeedStore from './stores/FeedStore';
import FindFriendsStore from './stores/FindFriendsStore';
import ColorSchemeStore from './stores/ColorSchemeStore';
import UIStore from './stores/UIStore';

const userStore = new UserStore();
const profileStore = new ProfileStore();
const playbackStore = new PlaybackStore();
const feedStore = new FeedStore();
const findFriendsStore = new FindFriendsStore();
const addSongStore = new AddSongStore(feedStore, profileStore);
const colorSchemeStore = new ColorSchemeStore();
const uiStore = new UIStore();

const stores = {
  userStore, addSongStore, profileStore, playbackStore, feedStore, findFriendsStore, colorSchemeStore, uiStore,
};

(window as any).stores = stores;

render((
  <Provider {...stores}>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeScreen} />

        <Route path="/about" component={AboutScreen} />

        <Route path="/users/:name" component={ProfilePostPlaylist} />
        <Route path="/users/:name/liked" component={ProfileLikedPlaylist} />
        <Route path="/users/:name/following" component={ProfileFollowing} />
        <Route path="/users/:name/followers" component={ProfileFollowers} />

        <Route path="/find-friends" component={FindFriendsScreen} />

        <Route path="/settings" component={SettingsScreen} />
      </Route>
    </Router>
  </Provider>
), document.querySelector('.react-root'));