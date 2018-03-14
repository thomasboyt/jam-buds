import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../pages/HomePage.vue';
// import AboutPage from '../pages/AboutPage.vue';

// import UserPageWrapper from '../pages/user/UserPageWrapper.vue';
// import UserPlaylistPage from '../pages/user/UserPlaylistPage.vue';
// import UserLikedPage from '../pages/user/UserLikedPage.vue';
// import UserFollowingPage from '../pages/user/UserFollowingPage.vue';
// import UserFollowersPage from '../pages/user/UserFollowersPage.vue';

// import FindFriendsPage from '../pages/FindFriendsPage.vue';
// import SettingsPage from '../pages/SettingsPage.vue';

// import NotFoundPage from '../pages/NotFoundPage.vue';

Vue.use(Router);

export default function createRouter() {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: [
      {path: '/', component: HomePage},
      // {path: '/about', component: AboutPage},
      // {path: '/user/:id', component: UserPageWrapper, children: [
      //   {path: '/', component: UserPlaylistPage},
      //   {path: 'liked', component: UserLikedPage},
      //   {path: 'following', component: UserFollowingPage},
      //   {path: 'followers', component: UserFollowersPage},
      // ]},
      // {path: '/find-friends', component: FindFriendsPage},
      // {path: '/settings', component: SettingsPage},
      // {path: '*', component: NotFoundPage},
    ],
  });
}