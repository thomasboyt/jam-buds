import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import AboutPage from '../pages/AboutPage.vue';

import WelcomePageWrapper from '../pages/WelcomePageWrapper.vue';
import RegistrationPage from '../pages/welcome/RegistrationPage.vue';
import ConnectPage from '../pages/welcome/ConnectPage.vue';
import ConnectTwitterPage from '../pages/welcome/ConnectTwitterPage.vue';

import UserPageWrapper from '../pages/UserPageWrapper.vue';
import UserPlaylistPage from '../pages/users/UserPlaylistPage.vue';
import UserLikedPage from '../pages/users/UserLikedPage.vue';
import UserFollowingPage from '../pages/users/UserFollowingPage.vue';
import UserFollowersPage from '../pages/users/UserFollowersPage.vue';

import PublicFeedPage from '../pages/PublicFeedPage.vue';
import FindFriendsPage from '../pages/FindFriendsPage.vue';

import SettingsPageWrapper from '../pages/SettingsPageWrapper.vue';
import ConnectionSettingsPage from '../pages/settings/ConnectionSettingsPage.vue';
import ProfileSettingsPage from '../pages/settings/ProfileSettingsPage.vue';
import NotificationSettingsPage from '../pages/settings/NotificationSettingsPage.vue';

import MixtapePage from '../pages/MixtapePage.vue';

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
          { path: 'connect-twitter', component: ConnectTwitterPage },
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

      { path: '/public-feed', component: PublicFeedPage },

      {
        path: '/settings',
        component: SettingsPageWrapper,
        children: [
          { path: '/', component: ConnectionSettingsPage },
          { path: 'profile', component: ProfileSettingsPage },
          { path: 'notifications', component: NotificationSettingsPage },
        ],
      },

      {
        path: '/mixtapes/:id',
        component: MixtapePage,
      },
      // {path: '*', component: NotFoundPage},
    ],
  });
}
