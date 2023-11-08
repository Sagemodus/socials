<template>
  <div>
  <div class="header">
     <button class="zurück-button" @click="closeWindow"> <font-awesome-icon :icon="['fas', 'arrow-left']"
          size="lg" /></button>
  </div>
   
             <ChatBox v-for="chat in pendingChats" :id="chat.chatId" :key="chat.chatId" :chat="chat" :isRequest="true" @click="selectchat(chat)"/>
 </div>
</template>

<script>
import ChatBox from './ChatBox.vue'

export default {
    components: {
        ChatBox
    },
        props: {
        pendingChats: Array,
    },
  setup(props,{ emit }) {
        const closeWindow = (() => {
    emit('toggleOpenRequests')
      })

      const selectchat = ((chat) => {

            emit('selectchat', chat)
        })

    // Gib die Variablen und Funktionen zurück, die im Template verwendet werden sollen
        return {
            closeWindow,
        selectchat
    };
  },
};
</script>

<style scoped>
.header {
    height: 35px;
    display: flex;
    flex-direction: row;
    align-items: center;
}
button.zurück-button {
        padding-left: 10px;
    display: flex;
    position: sticky;
    background-color: transparent;
    border: none;
    padding-left: 11px;
    padding-top: 17px;
}

</style>
