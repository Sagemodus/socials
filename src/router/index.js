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

// Profil weiterleitungen
import nestedReplyPage from '../components/profilebutton/nestedReplyPage.vue';
import bookmarkSaves from '../components/profilebutton/bookmarkSaves.vue';
import profileAndereUser from '../components/profilebutton/profileAndereUser.vue';

//passwort vergessen
/*
import PasswordForgottenComponent from '../components/PasswordForgottenComponent.vue';
import ResetPassword from '../components/ResetPasswordComponent.vue'

import store from '../store/store.js'; // Import your Vuex store
*/




const routes = [
  {
    path: "/feed",
    name: "feed",
    component: FeedView,
  },
  {
    path: "/search",
    component: Search_view,
  },
  {
    path: "/notifications",
    component: Notifications_view,
  },
  {
    path: "/messages",
    component: Messages_view,
  },
  {
    path: "/profil/:currentUserId",
    component: Profile_view,
  },
  {
    path: "/profile/:currentUserId",
    component: profileAndereUser,
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/Register_view.vue"),
  },
  {
    path: "/publiccomponent",
    name: "public",
    component: Public,
  },
  {
    path: "/fandfcomponent",
    name: "fandf",
    component: FAndF,
  },

  {
    path: "/popular",
    name: "Popular",
    component: PopularComponent,
  },
  {
    path: "/recent",
    name: "Recent",
    component: RecentComponent,
  },
  {
    path: "/people",
    name: "People",
    component: PeopleComponent,
  },

  {
    path: "/searchbar",
    name: "Searchbar",
    component: SearchbarComponent,
  },
  // Swipe-Profil-Komponente
  {
    path: "/swipe-profil-component",
    name: "SwipeProfilComponent",
    component: SwipeProfilComponent,
  },
  //Comemnt und Topic weiterleitung
  {
    path: "/topic/:id/:commentId?/:replyId?",
    component: TopicComponentGanzeSeite,
    name: "topic-ganze-seite",
    props: true,
    meta: {
      settingsComponentRoute: true, // Dieses Feld markiert die Route für SettingsComponent
    },
  },
  { path: "/topic/:id", component: TopicComponentGanzeSeite },
  {
    path: "/reply/:commentId",
    component: ReplyPage,
  },
  {
    path: "/nested-reply/:path?",
    name: "nested-reply-page",
    component: nestedReplyPage,
    props: true,
  },
  {
    path: "/bookmarksaves/:userId",
    component: bookmarkSaves,
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

/*

router.beforeEach((to, from, next) => {
  // Check if the route requires authentication and if the user is authenticated
  console.log(this.store.dispatch('verifyToken',this.store.currentUser.token))
  console.log(this.store.currentUser.token)
  if (this.store.dispatch('verifyToken',this.store.currentUser.token)==false) {
    // If not authenticated, redirect to the login page
    next('/login'); // You can specify your login route here
  } else {
    // Continue with the navigation
    next();
  }
});
*/
export default router;
