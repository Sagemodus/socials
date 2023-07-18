import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Home_view from './views/Home_view.vue';
import Search_view from './views/Search_view.vue';
import Notifications_view from './views/Notifications_view.vue';
import Messages_view from './views/Messages_view.vue';
import Profile_view from './views/Profile_view.vue';


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
<<<<<<< HEAD
=======

    //hallo 3

>>>>>>> 905b6d7d2d24dc4a74157273dd2ed621e414df9d
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
<<<<<<< HEAD
  {
    path: '/login',
    name: 'login', 
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
  }
=======
  // Navbar einbindung
  { path: '/', component: Home_view },
  { path: '/search', component: Search_view },
  { path: '/notifications', component: Notifications_view },
  { path: '/messages', component: Messages_view },
  { path: '/profile', component: Profile_view },

>>>>>>> 905b6d7d2d24dc4a74157273dd2ed621e414df9d
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
