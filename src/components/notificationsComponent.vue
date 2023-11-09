<template>
    <div class="notification-anzeige">
        <div class="notification-content">
            <div class="oberer-teil-notification">
                <img :src="icon()" alt="Notification Icon" class="notification-icon" />
                <div class="text-titel-message">
                    <h4>{{ notificationObjekt.title }}</h4>
                     <p>{{ $store.getters.formattedCreatedAt(notificationObjekt?.sentAt) }}</p>
<!--                     <p>{{ notificationObjekt.message }}</p> -->
                </div>
            </div>

            <!-- Topicbox -->
            <div v-if="notificationObjekt?.notificationType.startsWith('topic')" class="benachrichtigungTopic">
                <TopicBox :key="notificationObjekt.benachrichtigungsElementId"
                    :id="notificationObjekt.benachrichtigungsElementId" :disableelementsforNotifications="true" />
            </div>

            <!-- Commentbox -->
            <div v-else-if="notificationObjekt?.notificationType.startsWith('comment')" class="benachrichtigung">
                <CommentBox :key="notificationObjekt.benachrichtigungsElementId" :comment="comment" :topic="comment.topicId"
                    :disableelementsforNotifications="true" />


            </div>

            <!-- CommentReply -->
            <div v-else-if="notificationObjekt?.notificationType.startsWith('reply')" class="benachrichtigung">
                <div class="notification_view">
                              <comment-reply  :key="reply.id" :reply="reply"  :topic="topic"
              :commentId="reply.commentobjektId"   :depth="reply.depth" :disableelementsforNotifications="true"
              ></comment-reply>
                </div>
           
            </div>
     <div v-else-if="notificationObjekt?.notificationType.startsWith('chat')" class="benachrichtigung">
    <ChatBox :chat="chat" :disable="true" />
    </div>
    

        </div>
    </div>
</template>


<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import TopicBox from './TopicBox.vue';
import CommentBox from './CommentBox.vue';
import CommentReply from './CommentReply.vue';
import ChatBox from './chat/ChatBox.vue'

// eslint-disable-next-line

import { onMounted } from "vue";
export default {
    components: {
        TopicBox,
        CommentBox,
        CommentReply,
           ChatBox,
    },
    props: {
        notificationObjekt: Object,
    },
   

    setup(props) {

        const icon = () => {
            if (notificationType.value) {
                if (notificationType.value.startsWith('comment') && !notificationType.value.endsWith('like')) {
                    return '/comment.png';
                }
                if (notificationType.value.startsWith('topic')&& !notificationType.value.endsWith('like')) {
                    return '/topic.png';
                }
                if (notificationType.value.startsWith('reply') && !notificationType.value.endsWith('like')) {
                    return '/reply.png';
                }
                if (notificationType.value.endsWith('dislike')) {
                    return '/dislike.png';
                }
                if (notificationType.value.endsWith('like')) {
                    return '/like.png';
                }
                 if (notificationType.value.startsWith('chat')) {
                    return '/email.png';
                }
            }
        };

        // Setzen Sie hier den Pfad zu Ihrem Standard-Icon
        const store = useStore();
        const topic = store.getters.getTopicById(props.notificationObjekt.topicId);
        // Extrahieren Sie notificationType aus props
        const notificationType = computed(() => props.notificationObjekt.notificationType);
        const chatArray = computed (()=> store.state.chats)
        let comment = ref(null); // Initialisieren Sie comment mit null

        if (notificationType.value && notificationType.value.startsWith('comment')) {
                         store.dispatch("fetchTopics");
            comment.value = store.getters.getCommentById(props.notificationObjekt.benachrichtigungsElementId);
        }
        function findReplyById(object, id) {
            // Prüfen, ob das übergebene Objekt die gesuchte ID hat
            if (object.id === id) {
                return object;
            }

            // Funktion zum rekursiven Durchsuchen der Antworten
            function searchReplies(replies) {
                for (let reply of replies) {
                    if (reply.id === id) {
                        return reply;
                    }
                    // Wenn dieses Reply weitere Antworten hat, durchsuchen Sie diese
                    if (reply.replies) {
                        const found = searchReplies(reply.replies);
                        if (found) return found;
                    }
                }
            }

            for (let key of ['contraComments', 'proComments']) {
                if (object[key]) {
                    for (let comment of object[key]) {
                        // Prüfen, ob dieser Kommentar die gesuchte ID hat
                        if (comment.id === id) {
                            return comment;
                        }
                        // Wenn dieser Kommentar Antworten hat, durchsuchen Sie diese
                        if (comment.replies) {
                            const found = searchReplies(comment.replies);
                            if (found) return found;
                        }
                    }
                }
            }

            return null;
        }
        const reply = ref(null)
        if (notificationType.value.startsWith('reply')) {


             store.dispatch("fetchTopics");

            reply.value = findReplyById(topic, props.notificationObjekt.benachrichtigungsElementId);

        }
        let chat = null;
      
        if (notificationType.value.startsWith('chat')) {
          chat=  chatArray.value.find((chat) => chat.chatId == props.notificationObjekt.benachrichtigungsElementId)


        }
        return {
            icon,
            comment,
            reply,
            topic,
            chat
        };
   
    }

};
</script>

<style lang="scss" scoped >

.benachrichtigungTopic .topic-box  {
    display: flex;
    flex-direction: column;
    padding: 8px;
    margin: 10px auto;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 10px 15px rgba(1, 18, 251, 0.1 ) ;
    max-width: 100%;
    transition: transform 0.3s ease-in-out;
}

.comment-box {

    display: flex;
    flex-direction: column;
    /* padding: 8px; */
    /* margin: 10px auto; */
    background-color: transparent;
    border-radius: 10px;
    transition: transform 0.3s ease-in-out;
    padding-bottom: none;
    border-bottom: none;
    text-align: left;
    padding-left: 1vh;
    border-left: 0px;
        border-left: 0px solid #ccc;
}
.notification-anzeige .antwort-text{
    padding-top: 10px;
}
.text-titel-message {
    text-align: left;
}

.oberer-teil-notification {
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-content: left;
    gap: 15px;
}

.notification-anzeige[data-v-2ae5f6f6] {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    color: black;
    box-shadow: 0 5px 21px rgba(1, 18, 251, 0.1);
    /* padding-top: 20px; */
    border-radius: 10px;
    margin-left: 15px;
    margin-right: 15px;
    margin-top: 10px;
}

.notification-icon {
    width: 40px;
    height: 40px;
    margin-right: 10px;
}

.notification-content {
    width: 100%
}

.notification-content h4 {
    margin: 0;
    font-size: 16px;
}

.notification-content p {
    margin: 5px 0 0;
    font-size: 14px;
}

.comment-reply {
    border-left: 0px solid #ccc;
    position: static;
        text-align: justify;
}
p#antworttext {
    font-size: 14px;

}

p#topictext {
    font-size: 14px;
}


#antworttex {
    text-align: justify;
    padding-top: 10px;
}
.comment-reply ::v-deep #antworttext {
    padding-left: 0px;
}


.chat-container ::v-deep{
    padding: 0;
    border-bottom: none;

  
}
.message-text ::v-deep #message {
    color: black;
}
</style>