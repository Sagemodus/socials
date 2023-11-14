<template>
    <div class="kommentieren">
        <div class="send-message-form" v-if="!chat.isPending || chat.isPending && chat.messages.length == 0">
            <textarea v-model="messageContent" ref="messageTextarea" @keyup.enter="sendMessage"
                placeholder="Nachricht eingeben..."></textarea>
            <button @click="sendMessage"> <font-awesome-icon :icon="['fas', 'paper-plane']" /></button>
        </div>
    </div>
</template>

<script>
import autosize from 'autosize';
import { useStore } from 'vuex';
import { computed } from 'vue';

// eslint-disable-next-line
import { iconColor } from '../farben';


export default {
    props: ['chat'],
    setup(props) {
        const store = useStore();
        const currentUser = store.state.currentUser;
        console.log("CurrentUser", currentUser)
        const isStarter = computed(() => {
            if (currentUser.id == props.chat.startedBy) {
                return true
            }
            else {
                return false
            }

        })

        return {
            currentUser,
            isStarter
        };
    },

    data() {
        return {
            messageContent: ''
        };
    },
    mounted() {
        // Aktivieren Sie autosize für das Textfeld, sobald die Komponente eingehängt ist
        autosize(this.$refs.messageTextarea);
    },
    beforeUnmount() {
        // Entfernen Sie autosize, bevor die Komponente zerstört wird
        autosize.destroy(this.$refs.messageTextarea);
    },
    methods: {
        sendMessage() {
            console.log("CurrentUser", this.currentUser.id)
            if (this.messageContent.trim()) {
                const messageObj = {
                    senderId: this.currentUser.id, // Sie können dies durch die tatsächliche senderId ersetzen, wenn sie verfügbar ist
                    text: this.messageContent,
                };
                console.log("amk sende ")
                this.$emit('send-message', messageObj);
                this.messageContent = '';
            }
        }
    }
};
</script>

<style scoped>
.kommentieren {
    display: flex;
    justify-content: center;
}

.send-message-form[data-v-25bb51fc] {
    bottom: 0px;
    position: fixed;
    display: flex;
    flex-direction: row;
    border: 1px solid #c7c3c3;
    border-radius: 28px;
    width: 94%;
    margin-left: 14px;
    padding: 7px;
    background-color: white;
    margin: auto;
}

textarea:focus {
    outline: none;
    box-shadow: none;
}

textarea {
    width: 100%;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    border: none;
    height: 20px;
    /* Verhindert das manuelle Ändern der Größe des Textfelds */
}

button {
    border: none;
    background-color: transparent;
}

svg.svg-inline--fa.fa-paper-plane {
    height: 20px;
    color: var(--iconColor)
}
</style>
