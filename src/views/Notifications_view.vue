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
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import notificationComponent from "../components/notificationsComponent.vue";


export default {
  components: {
    notificationComponent,
  },
  setup() {
    const store = useStore();
    const currentUser = computed(() => store.state.currentUser);
    const notificationCurrenUserArray = ref([]); // Verwendung von ref, um eine reaktive Referenz zu erstellen

    onMounted(async () => {
      if (currentUser.value && currentUser.value.notifications) {
        notificationCurrenUserArray.value = [...currentUser.value.notifications].reverse(); // Kopie des Arrays erstellen und umkehren
      }

      const readArray = notificationCurrenUserArray.value.filter(notification => !notification.read).map(notification => notification.messageId);
      console.log(readArray, " : array");

      if (readArray.length > 0) {
        store.dispatch("readAllUnreadNotifications", { readArray, currentUserId: currentUser.value.id });
      }
    });

    return {
      notificationCurrenUserArray,
      currentUser,
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
