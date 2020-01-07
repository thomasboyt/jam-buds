import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../pages/index.vue';
import AboutPage from '../pages/about.vue';

import WelcomePageWrapper from '../pages/welcome.vue';
import RegistrationPage from '../pages/welcome/registration.vue';
import ConnectPage from '../pages/welcome/connect.vue';
import ConnectTwitterPage from '../pages/welcome/connect-twitter.vue';

import UserPageWrapper from '../pages/users/_id.vue';
import UserPlaylistPage from '../pages/users/_id/index.vue';
import UserLikedPage from '../pages/users/_id/liked.vue';
import UserFollowingPage from '../pages/users/_id/following.vue';
import UserFollowersPage from '../pages/users/_id/followers.vue';
import UserMixtapesPage from '../pages/users/_id/mixtapes.vue';

import PublicFeedPage from '../pages/public-feed.vue';
import FindFriendsPage from '../pages/find-friends.vue';

import SettingsPageWrapper from '../pages/settings.vue';
import ConnectionSettingsPage from '../pages/settings/index.vue';
import ProfileSettingsPage from '../pages/settings/profile.vue';
import NotificationSettingsPage from '../pages/settings/notifications.vue';

import MixtapePage from '../pages/mixtapes/_id.vue';

// TODO: turn into Nuxt error page https://nuxtjs.org/guide/views#layouts
import NotFoundPage from '../pages/NotFoundPage.vue';

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
          { path: 'mixtapes', component: UserMixtapesPage },
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
      { path: '*', component: NotFoundPage },
    ],
  });
}
