import { createRouter, createWebHashHistory } from 'vue-router';
//Views starten hier
import FeedView from '../views/FeedView.vue';
import Search_view from '../views/Search_view.vue';
import Notifications_view from '../views/Notifications_view.vue';
import Messages_view from '../views/Messages_view.vue';
import Profile_view from '../views/Profile_view.vue';
// Components für Feed
import Public from '../components/PublicComponent.vue';
import FAndF from '../components/FAndFComponent.vue';

import TopicComponentGanzeSeite from '../components/TopicComponentsGanzeSeite.vue';

//Components für Search
import PopularComponent from '../components/PopularComponent.vue';
import RecentComponent from '../components/RecentComponent.vue';
import PeopleComponent from '../components/PeopleComponent.vue';

//Components für Benachrichtigung

import SearchbarComponent from '../components/SearchbarComponent.vue';
// Swipe-Profil-Komponente
import SwipeProfilComponent from '../components/SwipeProfilComponent.vue';
//CommentPage
import ReplyPage from '../components/SingleReplyPage.vue';




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
    path: '/popular',
    name: 'Popular',
    component: PopularComponent,
  },
  {
    path: '/recent',
    name: 'Recent',
    component: RecentComponent,
  },
  {
    path: '/people',
    name: 'People',
    component: PeopleComponent,
  },
 


 
  {
    path: '/searchbar',
    name: 'Searchbar',
    component: SearchbarComponent
  },
  // Swipe-Profil-Komponente
  {
    path: '/swipe-profil-component',
    name: 'SwipeProfilComponent',
    component: SwipeProfilComponent
  },
  //Comemnt und Topic weiterleitung
  { path: '/topic/:id', component: TopicComponentGanzeSeite },
  {
    path: '/reply/:commentId',
    component: ReplyPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  }
});

export default router;
