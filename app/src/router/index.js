import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import AboutPage from '../pages/AboutPage.vue';

import UserPageWrapper from '../pages/UserPageWrapper.vue';
import UserPlaylistPage from '../pages/users/UserPlaylistPage.vue';
import UserLikedPage from '../pages/users/UserLikedPage.vue';
import UserFollowingPage from '../pages/users/UserFollowingPage.vue';
import UserFollowersPage from '../pages/users/UserFollowersPage.vue';

import FindFriendsPage from '../pages/FindFriendsPage.vue';
// import SettingsPage from '../pages/SettingsPage.vue';

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
      // {path: '/settings', component: SettingsPage},
      // {path: '*', component: NotFoundPage},
    ],
  });
}
