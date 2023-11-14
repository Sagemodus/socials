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
import { iconColor } from "../src/components/farben";



// Fetch topics and users
    const fetchData = async () => {
      try {
  
        const userString = localStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          store.commit("auth_success", userData);
          await store.dispatch("fetchTopics");
        await store.dispatch("fetchUsers", userData);
        }
        else {
          
        await store.dispatch("fetchUsers");
        await store.dispatch("fetchTopics");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
 };
  




// eslint-disable-next-line no-unused-vars
fetchData().then(() => {
  const app = createApp(App);
  app.use(store);
      const currentUser = store.state.currentUser;
  /*eslint-disable*/
  if (!currentUser) {
    

  }
  else {




     if (currentUser) {
       const userfarbe = currentUser.farbe;
       const color = userfarbe ? iconColor(userfarbe) : "gray";
       document.documentElement.style.setProperty("--iconColor", color);
     }
  }


     library.add(fas);
     library.add(far);

     app.use(router);
     app.component("font-awesome-icon", FontAwesomeIcon);

     app.config.globalProperties.$swal = Swal;
     app.mount("#app");



 
    });
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





