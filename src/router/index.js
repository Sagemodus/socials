import { createRouter, createWebHashHistory } from 'vue-router';
import FeedView from '../views/FeedView.vue';
import Search_view from '../views/Search_view.vue';
import Notifications_view from '../views/Notifications_view.vue';
import Messages_view from '../views/Messages_view.vue';
import Profile_view from '../views/Profile_view.vue';
import Public from '../components/PublicComponent.vue';
import FAndF from '../components/FAndFComponent.vue';
import Community from '../components/CommunityComponent.vue';

const routes = [
  {
    path: '/feed',
    component: FeedView
  },
  {

    path: '/search',
    component: Search_view
  },
  {
    path: '/notifications',
    component: Notifications_view
  },
  {
    path: '/messages',
    component: Messages_view
  },
  {
    path: '/profile',
    component: Profile_view
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import ('../views/Register_view.vue')
  },
  {
    path: '/publiccomponent',
    name: 'public',
    component: Public
  },
  {
    path: '/fandfcomponent',
    name: 'fandf',
    component: FAndF
  },
  {
    path: '/communitycomponent',
    name: 'community',
    component: Community
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
