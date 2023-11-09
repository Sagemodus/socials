import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';
import router from './router';
import store from './store/store';
import Swal from 'sweetalert2';
import axios from 'axios';

// Fetch topics and users
/* eslint-disable */
const fetchData = async () => {
  try {
    await store.dispatch('fetchTopics');
    await store.dispatch('fetchUsers');

    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      store.commit('auth_success', userData);
    }

    const app = createApp(App);
    app.use(router);
    app.component('font-awesome-icon', FontAwesomeIcon);
    app.use(store);
    app.config.globalProperties.$swal = Swal;
    app.mount('#app');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Set up Axios interceptors for handling 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      store.dispatch('logout');
    }
    return Promise.reject(error);
  }
);

library.add(fas);
library.add(far);

await store.dispatch("fetchTopics");
   
await store.dispatch("fetchUsers");
await store.dispatch("fetchOnlineUsers");
await store.dispatch("initializeStore");
library.add(fas)
library.add(far)
const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(store)

app.config.globalProperties.$swal = Swal;
app.mount('#app')

