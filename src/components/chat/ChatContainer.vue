<template>
    <div class="chat-menu">
        <ChatSidebar v-if="!selectedChat" :chats="chats" @chat-selected="handleChatSelected" />
        <div class="chat-fenster" v-if="selectedChat">

            <button @click="deselectChat" class="back-button"><font-awesome-icon :icon="['fas', 'arrow-left']"
                    size="lg" /></button>
            <MessageList :messages="messages" :chat="selectedChat" @deselect-chat="deselectChat" />
            <SendMessageForm @send-message="handleSendMessage" :chat="selectedChat" />
        </div>
    </div>
</template>

<script>
import MessageList from './MessageList.vue';
import SendMessageForm from './SendMessageForm.vue';
import ChatSidebar from './ChatSidebar.vue';
import SocketService from '../../services/SocketService';
import { useStore } from 'vuex';
import { mapMutations } from 'vuex';
import { computed } from 'vue';

export default {
    components: {
        MessageList,
        SendMessageForm,
        ChatSidebar,

    },
    emits: ['deselectChat'],
    setup() {
        const store = useStore();
        const chats = computed(() => {
            return store.state.chats
        });


        return {
            chats,
            store
        };
    },
    data() {
        return {
            messages: [],
            selectedChat: null
        };
    },
    created() {


        SocketService.onMessage((message) => {
            console.log("kure", this.store.state.currentUser)
            console.log("on message jeztzt", message)


            this.messages.push(message);



        });
        this.loadSelectedChat();


    },
    beforeUnmount() {

        this.setShowNavbar(true);
    },
    watch: {
        selectedChat(newVal) {
            if (newVal) {
                this.setShowNavbar(false);
            } else {
                this.setShowNavbar(true);
            }
        },
    },
    methods: {
        ...mapMutations(['setShowNavbar']),

        loadSelectedChat() {
            const savedChatId = sessionStorage.getItem('selectedChatId');
            if (savedChatId) {
                const chat = this.chats.find(chat => chat.chatId == savedChatId);
                if (chat) {
                    this.selectedChat = chat;
                    this.messages = chat.messages || [];
                }
            }
        },


        deselectChat() {
            console.log("test")
            this.selectedChat = null;
            this.saveSelectedChat(null);
        },

        handleChatSelected(chatId) {
            console.log(this.chats);
            console.log(chatId);

            // Fetch the chat based on the selected chatId
            const chat = this.chats.find((chat) => chat.chatId == chatId);
            console.log(chat);

            this.selectedChat = chat;
            this.messages = chat ? chat.messages : [];
            this.saveSelectedChat(chatId);
            // Speichere den ausgewählten chatId im Local Storage

        },
        saveSelectedChat(chatId) {
            sessionStorage.setItem('selectedChatId', chatId);
        },

        handleSendMessage(message) {
            // Setzen der Chat-ID für die Nachricht
            message.chatId = this.selectedChat.chatId;
            const currentUser = this.$store.state.currentUser;
            const currentUserId = currentUser.id;
            // Finden des entsprechenden Chats
            const chat = this.chats.find((chat) => chat.chatId === message.chatId);
            let zielId = null;
            if (chat.participants[0] === chat.participants[1]) {
                console.log("sich selber")
                zielId = currentUserId;
            }
            else {
                zielId = chat.participants.find((id) => id !== currentUserId);
            }

            console.log(zielId);
            // Konsolenausgaben für Debugging-Zwecke
            console.log(this.chats.find((chat) => chat.chatId === message.chatId));
            console.log(message);
            console.log(this.selectedChat.chatId);

            // Senden der Nachricht und Dispatchen der Benachrichtigung
            SocketService.sendMessage(message)

            this.$store.dispatch('sendNotification', {
                userId: message.senderId,
                message: "Sie haben eine neue Chatnachricht",
                notificationType: "chatNotification",
                zielId: zielId,
                benachrichtigungsElementId: chat.chatId,
                topicId: null, // hier wird die chatId
            });


        }
    }
};
</script>

<style scoped>
.chat-menu {
    display: flex;
    flex-direction: row;
    width: 100%;
    /* Damit es die gesamte Breite des Fensters einnimmt */
}

.chat-fenster {
    display: none;
    flex: 1;
}

button.back-button {
    left: 0;
    position: fixed;
    border: none;
    background-color: transparent;
    padding: 10px 0px 0px 15px;
    z-index: 999;
}

/* Für Bildschirme kleiner als 768px */
@media screen and (max-width: 767px) {
    .chat-sidebar {
        width: 100%;
        /* Damit es die gesamte Breite des Handy-Fensters einnimmt */
    }

    .chat-fenster {
        display: block;
    }
}

/* Für Bildschirme von 768px und größer */
@media screen and (min-width: 768px) {
    .chat-fenster {
        display: block;
    }

    .chat-sidebar {
        display: block;
    }
}
</style>