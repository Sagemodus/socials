<template>
    <div class="chat-container" v-if="!disable" @click="updateChatRead">
        <img :src="user?.profileImage" alt="Author Profile Image" class="author-image" />
        <div class="chat-details">
            <div class="name-zeit">
                <span class="author-name">{{ user?.name }}</span>
                <p class="message-time">{{ $store.getters.formattedCreatedAt(lastMessage?.timestamp) }}</p>
                       <div class="pending-badge" v-if="isStarter && chat.isPending">
                        <img class="clock-badge" src="../../../public/wall-clock.png" alt="">
                </div>
            </div>

            <div v-if="truncatedLastMessage" class="last-message">

                <p class="message-text" :class="{
                    'text-black': disable,
                    'text-gray': !disable,
                    'font-bold': !chat.read && !disable
                }">
                    {{ truncatedLastMessage }}
                </p>
            </div>

            
        </div>
    </div>
    <div v-else>
        <p class="message-text" :class="{ 'text-black': disable, 'text-gray': !disable }">{{ truncatedLastMessage }}</p>
    </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
/* eslint-disable no-unused-vars */

export default {

    props: {
        chat: Object,
        disable: Boolean,
        isRequest: {
            type: Boolean,
            default: false,
        }
    },
    setup(props) {
        const store = useStore();
        const currentUserId = store.state.currentUser.id;
        let userId = ref(null);
        const updateChatRead = (async () => {
            await store.dispatch("readChat", props.chat)
        });
        if (props.chat?.participants[0] === props.chat?.participants[1]) {

            // eslint-disable-next-line
         userId = props.chat?.participants[0];

        }
        else {
            userId = props.chat.participants.find((id) => id !== currentUserId);
        }
        // Use computed to maintain reactivity
        const isStarter = computed(() => {
            if (currentUserId == props.chat.startedBy) {
                return true
            }
            else {
                return false
            }

        })

        const user = computed(() => store.getters.getUserById(userId));
        const lastMessage = computed(() => {
            if (props.chat?.messages && props.chat?.messages.length > 0) {
                return props.chat.messages[props.chat.messages.length - 1];
            }
            return null;
        });
        const truncatedLastMessage = computed(() => {
            if (lastMessage.value && lastMessage.value.text.length > 35) {
                return lastMessage.value.text.substring(0, 35) + '...';
            }
            return lastMessage.value ? lastMessage.value.text : '';
        });

        // Return the computed properties
        return {
            user,
            lastMessage,
            truncatedLastMessage,
            updateChatRead,
            isStarter
        };
    },
};
</script>

<style scoped>
.clock-badge[data-v-35ac558c] {
    height: 14px;
    padding-top: 4px;

}
.pending-badge {
padding-left: 10px;
}
.text-black {
    color: black;
}

.text-gray {
    color: #8e8e8e;
}

.name-zeit {
    display: flex;
    align-items: center;
    align-content: center;
}

p.message-time {
    padding-left: 10px;
    max-height: 20px;
    margin: 0px;

}

.chat-container {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #e6e6e6;
    height: 38px;


}

.author-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
}

.chat-details {
    flex: 1;
    text-align: left;
}

.author-name {
    font-weight: bold;
    color: #262626;
}

.last-message {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10px;


}

p.message-text {
    word-break: break-word;
    margin: 0;
    padding-top: 5px;
}

.message-text {

    font-size: 14px;
    margin-right: 10px;
    text-align: left;
}

.message-time {
    color: #c7c7c7;
    font-size: 12px;
}
</style>
