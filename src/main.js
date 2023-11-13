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
        await store.dispatch("fetchTopics");
        await store.dispatch("fetchUsers");
        const userString = localStorage.getItem("user");
        console.log("user: ", userString);
        if (userString) {
          const userData = JSON.parse(userString);
          console.log("hello");
          store.commit("auth_success", userData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
 };
    console.log("user: ", store.state.currentUser);




// eslint-disable-next-line no-unused-vars
fetchData().then(() => {
  const app = createApp(App);
      app.use(store);
      const currentUser = store.state.currentUser;
      /*eslint-disable*/
      const userId = currentUser.id;
      SocketService.init(currentUser.id);

      if (currentUser) {
        const userfarbe = currentUser.farbe;
        const color = userfarbe ? iconColor(userfarbe) : "gray";
        console.log(color);
        document.documentElement.style.setProperty("--iconColor", color);
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





