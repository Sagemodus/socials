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


/* import PasswordForgottenComponent from '../components/PasswordForgottenComponent.vue';
import ResetPassword from '../components/ResetPasswordComponent.vue' */
/* 
import store from '../store/store.js'
*/


import store from '../store/store.js'; // Import your Vuex store


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
    name: "notifications",
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
  //Reset password
  {
    path: "/resetPassword",
    name: "ResetPassword",
    component: ResetPassword
  },
  {
    path: "/resetPasswordConfirm",
    name: "ResetPasswordConfirm",
    component: PasswordForgottenComponent
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

 router.beforeEach((to, from, next) => {
  const token = store.state.currentUser?.token;
  // If the route is not the login route and there's no token, redirect to the login route
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
}); 

export default router;