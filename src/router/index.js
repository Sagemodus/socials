import { createRouter, createWebHashHistory } from 'vue-router'
import Home_view from '../views/Home_view.vue';
import Search_view from '../views/Search_view.vue';
import Notifications_view from '../views/Notifications_view.vue';
import Messages_view from '../views/Messages_view.vue';
import Profile_view from '../views/Profile_view.vue';


const routes = [
  
  // Navbar einbindung
  { path: '/', component: Home_view },
  { path: '/search', component: Search_view },
  { path: '/notifications', component: Notifications_view },
  { path: '/messages', component: Messages_view },
  { path: '/profile', component: Profile_view },

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
