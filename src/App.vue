<template>
  <div>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <navbar class="navbar-fixed" />
    <div id="app">
      <router-view />
    </div>
  </div>
</template>

<script>
import Navbar from './components/navbar_unten.vue'
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useStore } from 'vuex';


export default {
  components: {
    Navbar,

  },
  setup() {
    const store = useStore();

    const firebaseConfig = {
      apiKey: "AIzaSyDjimJJcGiL1O_6Swpzp2d5xaA5-AI4CpI",
      authDomain: "procon-14ef5.firebaseapp.com",
      projectId: "procon-14ef5",
      storageBucket: "procon-14ef5.appspot.com",
      messagingSenderId: "598092499566",
      appId: "1:598092499566:web:7bdfebff0c1dd13a2df47f",
      measurementId: "G-QX73B8G7V6"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);// eslint-disable-line no-unused-vars



    // Get registration token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    const messaging = getMessaging();

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // ...
    });

    console.log(store.state)
    getToken(messaging, { vapidKey: 'BJTzLLT-jiIVy-3Zse1A9ZqvQHPM8xl91xMvyAiTRtOZ_xViUWpy9G8eN9ZNm-ednER7gkg_KrYCXqfb2qz-KSI' }).then((currentToken) => {
      if (currentToken) {
        console.log(currentToken);

        // Send the token to your server
        fetch('http://localhost:3000/save-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: store.state.currentUser._id, token: currentToken })
        })
          .then(response => response.json())
          .then(data => {
            console.log('Token sent to the server:', data);
          })
          .catch((error) => {
            console.error('Error sending token to server:', error);
          });

      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
    return {
      store,
    };
  }

} 
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

#app p, span, h5,h4,h3,h2,h1  {
  font-family: Arial, Helvetica, sans-serif;
}

.navbar-fixed {
  position: fixed;
  bottom: 0;

  width: 100%;
  z-index: 999;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
  padding-top: 5px;
}

#app {
font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  margin-bottom: 60px;

  /* Platz für die Navbar reservieren */
}

#app .topic-text {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;



}

#app .comment-text {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  margin-bottom: 0px;
  padding-left: 60px;
  padding-right: 10px;
  margin-top: 0%;
  text-align: left;
}

#app .antwort-text {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  margin-top: 5px;
  margin-top: 0px;
  padding-left: 8px;

  padding-bottom: 0px;
  margin-bottom: 0px;
  text-align: left;
  padding-top: 5px;
}


#app .conversation-prompt {
  display: flex;
  max-height: 1%;
  text-align: center;
  justify-content: center;
}

/* Restlicher CSS-Code bleibt unverändert */
/* ... */
</style>
