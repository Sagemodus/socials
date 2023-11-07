<template>
  <div class="header">
     <button class="zurück-button" @click="$router.go(-1)"> <font-awesome-icon :icon="['fas', 'arrow-left']"
          size="lg" /></button>
  </div>
   
  <div class="NotificationArray">
    <notificationComponent 
      v-for="notificantion in notificationCurrenUserArray"
      :key="notificantion.messageId"
      :id="notificantion.messageId"
      :notificationObjekt="notificantion"

    />
  </div>
</template>

<script>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import notificationComponent from "../components/notificationsComponent.vue";
export default {
  components: {
    notificationComponent,
  },
  setup() {
    const store = useStore();
    const currentUser = computed(() => store.state.currentUser);
    const currentUserId = currentUser.value.id;
    const notificationCurrenUserArray = currentUser.value.notifications.reverse();
    const readArray = [];




    notificationCurrenUserArray.forEach(element => {
      if (!element.read) { // Überprüfen, ob read false ist
        readArray.push(element.messageId);
      }
    });
    if (readArray) {
      store.dispatch("readAllUnreadNotifications", { readArray, currentUserId  })
    }


 /*    const updateRead = (messageId) => {    // wird verwendet um ein einzelnes element al gelesen zu deklarieren
      store.dispatch("updateRead", { messageId, currentUserId })
     
    } */
    // Gib die Variablen und Funktionen zurück, die im Template verwendet werden sollen
    return {
        notificationCurrenUserArray,
      currentUser,
      readArray,
/*       updateRead */
    };
  },
};
</script>

<style scoped>
.NotificationArray {
          padding-top: 30px;
}
.header {
    height: 35px;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    position: fixed;
    background-color: white;
}
button.zurück-button {
 padding-left: 10px;
  display: flex;
  position: sticky;
  background-color: transparent;
  border: none;
          padding-left: 10px;
}
</style>
