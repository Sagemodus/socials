<template>
    <div class="header-profil">
        <img :src="zielUser.profileImage" alt="Profilbild" class="profile-image" @click="goToProfile">
        <h5 class="username">{{ zielUser.name }}</h5>
        <button class="info-button" @click="openInfoModal">
            <img class="info-button" src="../../../public/info.png">
        </button>

    </div>
    <div class="message-list" ref="messageListRef">
        <button v-if="showScrollButton" @click="scrollToBottom" class="back-to-bottom">
            <font-awesome-icon class="arrow" :icon="['fas', 'arrow-down']" size="2xl" />
        </button>
        <div v-for="message in messages" :key="message.timestamp"
            :class="{ 'message-outgoing': message.senderId === currentUser.id, 'message-incoming': message.senderId !== currentUser.id }">
            {{ message.text }}
        </div>
    </div>

    <!-- Modal-Komponente -->
    <InfoModal :show="infoModalOpen" @close="closeInfoModal">
        <!-- Modal-Inhalt hier einfügen -->
        <div class="header-popup">
            <h2>Conversation info</h2>
            <button @click="leaveConversation(chat)">
                <p>Leave conversation</p>
            </button>
        </div>

    </InfoModal>
    <div class="pending" v-if="chat.isPending && !isStarter">
        <p>you have a new request</p>
        <button @click="acceptRequest">accept</button>
        <button>reject</button>
    </div>
    <div v-if="chat.isPending && isStarter && chat.messages.length == 1">
        <p>the invitation must first be accepted before you can write further messages </p>
    </div>
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { watch, ref, nextTick } from 'vue';
import { onMounted, onBeforeUnmount } from 'vue';
import { iconColor } from '../farben';
import InfoModal from './InfoModal';
import SocketService from "../../services/SocketService";


export default {
    props: ['messages', 'chat'],
    components: {
        InfoModal,
    },
    emits: ['deselectChat'],
    setup(props, { emit }) {
        const store = useStore();
        const currentUser = computed(() => store.state.currentUser);
        const currentUserId = currentUser.value.id;
        const showScrollButton = ref(false);
        let userId = ref(null);
        const infoModalOpen = ref(false);
        const router = useRouter();

        const isStarter = computed(() => {
            if (currentUserId == props.chat.startedBy) {
                return true
            }
            else {
                return false
            }
            
        })

        const leaveConversation = (async (chat) => {
            console.log(chat)
            const chatId = chat.chatId;
            const payload = { chatId, currentUserId }
            await store.dispatch("removeChat", payload)
            deselectChatInParent()
        })

        const openInfoModal = () => {
            console.log("kure")
            console.log("Is:", infoModalOpen.value)
            infoModalOpen.value = true;
            console.log("Is:", infoModalOpen.value)
        };

        const closeInfoModal = () => {
            infoModalOpen.value = false;
        };
        const acceptRequest = () => {
            try {
                store.dispatch("acceptRequest", props.chat.chatId).then((response) => {

                    console.log("response :",response)

                    SocketService.updateRequest(props.chat.chatId)
                })
            } catch (error) {
                console.error("fehler beim weiterleiten zur action", error)
            }
        };


        if (props.chat.participants[0] === props.chat.participants[1]) {
            console.log("sich selber")
            userId = currentUserId;
        }
        else {
            userId = props.chat.participants.find((id) => id !== currentUserId);
        }


        const messageListRef = ref(null);

        const zielUser = store.getters.getUserById(userId);
        // Methode, um den Namen des Senders basierend auf der senderId zu holen
        const getSenderName = (senderId) => {
            const user = store.getters.getUserById(senderId);
            return user ? user.name : 'Unbekannt';
        };
        const goToProfile = () => {
            console.log("klickt")
            console.log(currentUser.value)
            console.log(currentUser.value.id === zielUser.id)
            if (currentUser.value.id === zielUser.id) {
                router.push(`/profil/${zielUser.id}`);
            }
            else {
                router.push(`/profile/${zielUser.id}`);
            }

        }
           

        watch(() => props.messages, () => {
            nextTick(() => {
                if (messageListRef.value) {
                    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
                }
            });
        }, { deep: true });

        const scrollToBottom = () => {
            nextTick(() => {
                if (messageListRef.value) {
                    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
                }
            });
        };

        const checkScroll = () => {
            // Aktualisieren Sie den Wert von showScrollButton basierend auf der Scroll-Position
            if (messageListRef.value) {
                const containerHeight = messageListRef.value.scrollHeight;
                showScrollButton.value = window.scrollY < containerHeight - 1000;
            }
        };
        onMounted(() => {
            window.addEventListener('scroll', checkScroll);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('scroll', checkScroll);
        });
        const deselectChatInParent = () => {
            console.log("kolleg")
            emit('deselect-chat');

        };

        return {
            getSenderName,
            currentUser,
            zielUser,
            goToProfile,
            messageListRef,
            scrollToBottom,  // Hinzugefügt
            showScrollButton,
            iconColor,
            closeInfoModal,
            openInfoModal,
            infoModalOpen,
            leaveConversation,
            deselectChatInParent,
            acceptRequest,
            isStarter
        };


    },
    mounted() {
        this.$nextTick(() => {
            window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
        });
    },
     created() {


         SocketService.onRequestupdate(       () => {
              /* eslint-disable */
            this.chat.isPending = false;
            /* eslint-disable */

        });


    },
};
</script>



<style scoped>
.info-button {
    background-color: transparent;
    border: none;
    height: 18px;
}

.info-button {
    background-color: transparent;
    border: none;
}

h2 {
    position: relative;
    display: flex;
    top: -33px;
    flex: 1;
    margin-top: 7px;
    justify-content: center;
}


.arrow {
    height: 18px;
    color: white;

}

.back-to-bottom {

    bottom: 50px;
    right: 20px;
    background-color: var(--iconColor);
    border: none;
    padding: 5px 20px 5px 20px;
    border-bottom-left-radius: 9999px;
    border-bottom-right-radius: 9999px;
    border-top-left-radius: 9999px;
    border-top-right-radius: 9999px;
    min-height: 36px;
    min-width: 36px;
    box-shadow: rgba(217, 217, 217, 0.2) 0px 0px 5px, rgba(217, 217, 217, 0.25) 0px 1px 4px 1px;

}

h5.username {
    margin: 0;
    padding: 5px;
}


.header-profil {
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: center;
    padding-top: 4px;
    position: fixed;
    margin: auto;
    background-color: white;
    width: 100%;
}

.profile-image {
    border-radius: 50%;
    width: 30px;

}

.message-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    overflow-x: auto;
    padding-top: 35px;
}

.message-outgoing {
    word-break: break-word;
}

.message-incoming {
    word-break: break-word;
}

.message-outgoing {
    background-color: #0099ff;
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    display: inline-block;
    max-width: 70%;
    margin: 5px;
    align-self: flex-end;

    /* Rechtsbündig für ausgehende Nachrichten */
}

.message-incoming {
    background-color: #f1f1f1;
    padding: 10px 15px;
    border-radius: 20px;
    display: inline-block;
    max-width: 70%;
    margin: 5px;
    align-self: flex-start;
    font-size: 14px;
    /* Linksbündig für eingehende Nachrichten */
}

.message-outgoing,
.message-incoming {
    max-width: calc(70% - 30px);
    /* 70% minus padding and any other spacing */
}

.back-to-bottom {
    position: fixed;


    right: 3px;
}
</style>