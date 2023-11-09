<template>
    <div class="chat-sidebar">
                <div v-if="showPopup" class="popup">
                    <div class="oberer-teil-popup">
                        <span class="search-icon"><font-awesome-icon :icon="['fas', 'search']" /></span>

                        <input v-model="searchTerm" @input="searchUsers" placeholder="Search user...">

                    </div>
                    <hr>

                    <div id="userssuche" v-for="user in filteredUsers" :key="user.id">
                        <userprofile class="userprofile" :user="user" @select-user="selectedUser">
                            <font-awesome-icon class="check-icon" :icon="['fas', 'check']" v-if="user.id === selectedUserId" />
                        </userprofile>

                        <!-- Chatten Button hinzugefügt -->

                    </div>

                    <span id="close" class="close-icon" @click="closePopup"><font-awesome-icon
                            :icon="['fas', 'xmark']" /></span>
                    <button :disabled="isButtonDisabled"
                        :style="{ background: isButtonDisabled ? 'grey' : iconColor(currentUser.farbe) }" @click="createChat"
                        id="createChat">Chat</button>
                </div>


        <div class="header-requests" v-if="!openRequests">
            <div class="header">
       <button class="zurück-button" v-if="!showPopup" @click="$router.go(-1)"> <font-awesome-icon :icon="['fas', 'arrow-left']"
            size="lg" /></button>
    </div>
   
            <h2 class="header-messages">Messages</h2>
            <div class="messages">
                <div class="newmessage">
                    <button @click="openPopup" class="newchat"> <img src="../../pictures/comment.png" alt=""> </button>

                </div>

            </div>
        </div>
        <div class="request-button"  v-if="!openRequests">
         <button class="anfrage-button" @click="toggleOpenRequests">Requests</button>

        </div>
        <div v-if="openRequests">
            <ChatRequests @toggleOpenRequests="toggleOpenRequests" :pendingChats="pendingChats" @selectchat="selectChat" />
        </div>

        <div v-else>


            <!-- Popup mit Suchleiste -->


            <ul>
                <li v-for="chat in chatsFiltered" :key="chat.chatId" @click="selectChat(chat)">
                    <ChatBox :chat="chat" />
                </li>
            </ul>

        </div>
        <!-- Button zum Öffnen des Popups -->

    </div>
</template>

<script>
import userprofile from '../profilebutton/profilComponent.vue'
import { useStore } from 'vuex';
import ChatBox from './ChatBox.vue'
import { iconColor } from '../farben';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import ChatRequests from './ChatRequests.vue';

export default {
    components: {
        userprofile,
        ChatBox,
        ChatRequests,
    },
    props: {
        chats: Object,
    },
    setup(props, { emit }) {
        const store = useStore();
        const currentUser = store.state.currentUser;
        const currentUserId = currentUser.id;
        const isButtonDisabled = ref(true);
        let selectedUserId = ref(null); // Speichern Sie die ID des ausgewählten Benutzers hier
        const selectedChatId = ref(null);

        // eslint-disable-next-line
            const router = useRouter();

        const pendingChats = props.chats.filter(chat => chat.isPending && chat.startedBy != currentUser.id);

        const chatsFiltered = props.chats.filter(chat => !chat.isPending || chat.isPending && chat.startedBy == currentUser.id);
        const selectedUser = (user) => {
            if (selectedUserId.value != null) {
                console.log("was das ")
                isButtonDisabled.value = true
                selectedUserId.value = null;
            }
            else {
                console.log("börüüü laan")
                selectedUserId.value = user.id; // Speichern Sie die ID des ausgewählten Benutzers
                console.log(selectedUserId)
                isButtonDisabled.value = false; // Button aktivieren
            }

        }
        const iconColorComputed = computed(() => iconColor(currentUser.farbe));
        const openRequests = ref(false) // Initial auf false setzen

        const toggleOpenRequests = () => {
            openRequests.value = !openRequests.value // Wert umschalten
        }

        const createChat = () => {
            if (selectedUserId.value) {
                const payload = { currentUserId, propuserId: selectedUserId.value };
                store.dispatch('createChat', payload)
                    .then((newChat) => { // Hier erfassen Sie den zurückgegebenen Chat
                        console.log("erfolgreich", newChat);
                        emit('chat-selected', newChat.chatId); // Verwenden Sie die ID des neuen Chats oder einen Standardwert
                    })
                    .catch(error => {
                        console.error("Fehler beim Erstellen des Chats:", error);
                        if (error.response.data.message == "Ein Chat zwischen diesen Benutzern existiert bereits.") {

                            try {
                                store.dispatch("updateActiveChats", error.response.data.chat.chatId)
                                store.state.chats.push(error.response.data.chat)
                                console.log("wird gepusht")

                            } catch (error) {
                                console.error("", error)
                            }
                            emit('chat-selected', error.response.data.chat.chatId)
                        }

                    });
            } else {
                isButtonDisabled.value = true;
                console.error("Kein Benutzer ausgewählt!");
            }

        }

        return {
            createChat,
            selectedUser,
            iconColor,
            currentUser,
            isButtonDisabled,
            selectedChatId,
            selectedUserId,
            iconColorComputed,
            pendingChats,
            openRequests,
            toggleOpenRequests,
            chatsFiltered
        };
    },
    data() {
        return {
            showPopup: false,
            searchTerm: '',
            filteredUsers: []
        };
    },
    computed: {
        users() {
            return this.$store.state.users;
        }
    },
    methods: {
        selectChat(chat) {
            console.log(chat);

            this.$emit('chat-selected', chat.chatId);
        },
        openPopup() {
            this.showPopup = true;
        },
        closePopup() {
            this.showPopup = false;
        },
        searchUsers() {
            if (this.searchTerm) {
                this.filteredUsers = this.users.filter(user =>
                    user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
                );
            } else {
                this.filteredUsers = [];
            }
        },

    }
};
</script>

<style  scoped>

.header {
    height: 25px;
    display: flex;
    flex-direction: row;
    align-items: center;
}
button.zurück-button {
 
  display: flex;
  position: sticky;
  background-color: transparent;
  border: none;
  color: black;
      padding: 0px;
 
}
.request-button {
    display: flex;
    justify-content: flex-end;
}
h2.header-messages {
    margin: 0px;
    font-size: 16px;
    width: 80%;
}
.messages {
    width: 10%;
}
button.anfrage-button {
    background: transparent;
    color: #0079d3;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
    right: 10px;
    padding: 0px;
    padding-right: 5px;
        padding-top: 10px;

}



.header-requests[data-v-514393c6] {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    padding-top: 6px;
    align-items: center;
}

#userssuche {
    padding: 0;
}

/* Allgemeiner Stil für die Sidebar */
button#createChat {
    padding: 8px 10px 8px 10px;
    right: 0px;
    position: absolute;
    top: 5px;
    border-radius: 15px;
    margin-right: 5px;
}

svg.svg-inline--fa.fa-magnifying-glass {
    margin-right: 10px;
}

.oberer-teil-popup {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

input[type="text"] {
    width: 100%;
    padding: 8px 8px 8px 30px;
    /* Links Padding erhöht, um Platz für das Suchsymbol zu schaffen */
    border: 1px solid #e6e6e6;
    border-radius: 20px;
    /* Abgerundete Ecken für die Suchleiste */
    margin-bottom: 16px;
    position: relative;
    /* Position auf "relative" setzen, um das Suchsymbol zu positionieren */

}

input {
    /* border-inline: revert-layer; */
    border: none;
}

input:focus {
    outline: none;
    border: none;
    /* oder setzen Sie Ihre eigenen Stile */
}

/* Stil für das Suchsymbol */

.chat-sidebar {
    background-color: #ffffff;
    border-right: 1px solid #e6e6e6;
    width: 20%;
    height: 95vh;
    overflow-y: auto;
    /* Hier wurde die Scrollbar hinzugefügt */
}

/* Stil für das Popup */
.popup {
    position: absolute;
    /* top: 50px; */
    /* right: 20px; */
     width: 20%;
    border: 1px solid #e6e6e6;
    padding: 0;
    background-color: #fff;
    z-index: 1000;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    margin: auto;
}

.popup>*:not(hr) {
    padding: 15px 20px 0px 20px;
    /* oder den gewünschten padding-Wert */
}

/* Stil für den Button */
button {
    background-color: #0095f6;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button.newchat {
background-color: transparent;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    padding: 0px;
}



/* Stil für die Suchleiste */


/* Stil für die Benutzerliste */
ul {
    list-style-type: none;
    padding: 0;

}

/* Stil für jeden Chat-Eintrag */
ul>div {
    border-bottom: 1px solid #e6e6e6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

ul>div:hover {
    background-color: #f7f7f7;
}

img {
    width: 25px;

}



#close.close-icon {
    position: absolute;
    top: 10px;
    left: 10px;
    cursor: pointer;
    font-weight: bold;
    padding: 0px;
}

@media only screen and (max-width: 768px) {
    .chat-sidebar {
        width: 100vw;
        /* Setzt die Breite auf die gesamte Bildschirmbreite */
        height: 90vh;
        /* Setzt die Höhe auf die gesamte Bildschirmhöhe */
    }

    .popup {
        width: 100vw;
        height: 90vh;
        border: none;
        box-shadow: none;
        margin: 0;
        overflow-y: hidden;
        z-index: 0;
        top: 0px;
    }

}
</style>