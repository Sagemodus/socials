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
import SocketService from "./services/SocketService";


// Fetch topics and users
    const fetchData = async () => {
      console.log("amk");
      try {
  
        const userString = localStorage.getItem("user");
        console.log("user: ", userString);
        if (userString) {
          const userData = JSON.parse(userString);
          console.log("hello");
          store.commit("auth_success", userData);
          await store.dispatch("fetchTopics");
        await store.dispatch("fetchUsers", userData);
        }
        await store.dispatch("fetchUsers");
        await store.dispatch("fetchTopics");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
 };
  




// eslint-disable-next-line no-unused-vars
fetchData().then(() => {
    console.log("user: ", store.state.currentUser);
  const app = createApp(App);
  app.use(store);
  console.log("currenuser", store.state.currentUser);
      const currentUser = store.state.currentUser;
  /*eslint-disable*/
  if (!currentUser) {
    

  }
  else {
     const userId = currentUser.id;

     if (userId) {

       SocketService.init(currentUser.id);
     } else {
       console.log("userId ned gfunde");
     }

     if (currentUser) {
       const userfarbe = currentUser.farbe;
       const color = userfarbe ? iconColor(userfarbe) : "gray";
       console.log(color);
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





