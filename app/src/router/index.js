import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import AboutPage from '../pages/AboutPage.vue';

import WelcomePageWrapper from '../pages/WelcomePageWrapper.vue';
import RegistrationPage from '../pages/welcome/RegistrationPage.vue';
import ConnectPage from '../pages/welcome/ConnectPage.vue';

import UserPageWrapper from '../pages/UserPageWrapper.vue';
import UserPlaylistPage from '../pages/users/UserPlaylistPage.vue';
import UserLikedPage from '../pages/users/UserLikedPage.vue';
import UserFollowingPage from '../pages/users/UserFollowingPage.vue';
import UserFollowersPage from '../pages/users/UserFollowersPage.vue';

import FindFriendsPage from '../pages/FindFriendsPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';

import AddSongPage from '../pages/AddSongPage.vue';

// import NotFoundPage from '../pages/NotFoundPage.vue';

Vue.use(Router);

export default function createRouter() {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: [
      { path: '/', component: HomePage },
      { path: '/about', component: AboutPage },
      {
        path: '/welcome',
        component: WelcomePageWrapper,
        children: [
          { path: 'registration', component: RegistrationPage },
          { path: 'connect', component: ConnectPage },
        ],
      },
      {
        path: '/users/:id',
        component: UserPageWrapper,
        children: [
          { path: '/', component: UserPlaylistPage },
          { path: 'liked', component: UserLikedPage },
          { path: 'following', component: UserFollowingPage },
          { path: 'followers', component: UserFollowersPage },
        ],
      },
      { path: '/find-friends', component: FindFriendsPage },
      { path: '/settings', component: SettingsPage },
      { path: '/add-song', component: AddSongPage },
      // {path: '*', component: NotFoundPage},
    ],
  });
}
