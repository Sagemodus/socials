//settingsComponent.vue
<template>
    <div class="profile-page">
        <div class="background-image"></div>
   


        <img :src="currentUser.profileImage" alt="Profilbild" class="profile-image">



        <div class="profile-content">


            <div>
                <h5>{{ currentUser?.name }}</h5>
                <p>{{ currentUser?.bio }}</p>
                <p> <font-awesome-icon :icon="['far', 'calendar-days']" class="icon" /> {{ " " + 'Joined ' +
                    currentUser?.joinedAt
                }}
                </p>

                <!--         <div class="follow-container">
          <button class="following-buttons">
            <p>{{ currentUser?.following.length + ' Following' }}</p>
          </button>

          <button class="following-buttons">
            <p>{{ currentUser?.followers.length + ' Followers' }}</p>
          </button>
        </div> -->

            </div>

        </div>

        <SwipeProfilComponentVue>


            <template #comments>
                <div>
                    <div v-for="comment in procreatedCommentList" :key="comment.id">
                        <!-- Hier kannst du die Inhalte der procreated Topics anzeigen -->
                        <CommentBox :comment="comment" :topic="comment.topicId" :showreply="showreply" :anzeige="false" />
                    </div>
                    <div v-for="comment in contracreatedCommentsList" :key="comment.id" :topic="comment.topicId">
                        <!-- Hier kannst du die Inhalte der contracreated Topics anzeigen -->
                        <CommentBox :comment="comment" :topic="comment.topicId" :anzeige="false" />
                    </div>
                </div>
            </template>


            <!-- Inhalte für den "Replies"-Tab -->
            <template #replies>
                <comment-reply v-for="reply in replySuche" :key="reply.id" :reply="reply" :depth="1" :topic="reply.topicId"
                    :commentId="reply.commentobjekt.id" :commentobjekt="reply.commentobjekt"
                    :commentIndex="reply.commentIndex" :id="reply.id"></comment-reply>

                <comment-reply v-for="reply in nestedReplySuche" :key="reply.id" :reply="reply" :depth="2"
                    :topic="reply.topicId" :commentId="reply.commentobjekt.id" :commentobjekt="reply.commentobjekt"
                    :commentIndex="reply.commentIndex" :id="reply.id"></comment-reply>
            </template>

            <!-- Inhalte für den "Likes"-Tab -->
            <template #votes>
                <div>
                    <div v-for="topic in TopicUpVotes" :key="topic.id" :id="topic.id">
                        <TopicBox :key="topic.id" :id="topic.id" :isUpVoted ="true" :disableelements ="true" />
                    </div>

                </div>
                <div>
                    <div v-for="topic in TopicDownVotes" :key="topic.id" :id="topic.id">
                        <TopicBox :key="topic.id" :id="topic.id" :isDownVoted ="true" :disableelements ="true" />
                    </div>

                </div>
            </template>




        </SwipeProfilComponentVue>


    </div>
</template>
<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { iconColor } from '../farben';
import { ref } from 'vue';
import SwipeProfilComponentVue from '../SwipeProfilComponent.vue'
import CommentBox from '../CommentBox.vue'
import CommentReply from '../CommentReply.vue'
import TopicBox from '../TopicBox.vue'; // Hier importiere TopicBox
import { useRoute, useRouter } from 'vue-router';

export default {
    components: {
        SwipeProfilComponentVue,
        CommentBox,
        CommentReply,
        TopicBox,
    },
    setup() {

        const route = useRoute();
        const store = useStore();
        const state = store.state;
        const topics = state.topics;
        const userId = route.params.currentUserId;
        const router = useRouter();


        // Verwende computed, um currentUser reaktiv zu machen
        const currentUser = computed(() => store.state.users[userId - 1]);

        const showreply = false;

        // Erhalte Zugriff auf den Vuex-Store



        const procreatedComments = computed(() => currentUser.value.procreated);
        const contracreatedComments = computed(() => currentUser.value.contracreated);
        const repliescreated = computed(() => currentUser.value.createdReplies);

        const bookmarkrouting = () => {
            router.push(`/bookmarksaves/${userId}`)
        }
        const nestedRepliesPaths = computed(() => {
            return currentUser.value.nestedReplies.map(reply => reply);
        });


        const parseId = (element) => {
            const parts = element.split('/').filter(part => part !== ''); // Entferne leere Teile
            const ids = {
                topicIndex: parts[0],
                type: parts[1].split('_')[0],
                commentIndex: parts[1].split('_')[1],
            };

            // Füge alle weiteren Teile als replyIndex hinzu
            for (let i = 2; i < parts.length; i++) {
                ids['replyIndex' + (i - 1)] = parts[i];
            }

            return ids;
        }


        let topicsSuche = [];
        let commentSuche = [];
        let replySuche = [];
        let nestedReplySuche = [];

        function getLastElementFromPath() {
            // Leeren Sie die Arrays zu Beginn jeder Ausführung der Funktion
            topicsSuche.value = [];
            commentSuche.value = [];
            replySuche.value = [];
            nestedReplySuche.value = [];

            // Schleife durch die Pfade
            nestedRepliesPaths.value.forEach(path => {
                const ids = parseId(path); // Verwende die parseId Funktion, um die IDs zu extrahieren
                const anzahleindexes = Object.keys(ids).length - 1;


                let pathZurSuche = "";

                for (let i = 0; i < anzahleindexes; i++) {
                    // Schleife durch die IDs
                    if (i === 0) {
                        pathZurSuche = `topics[${ids.topicIndex}]`;

                    }
                    else if (i === 1) {
                        if (ids.type === 'pro') {
                            pathZurSuche += `.proComments[${ids.commentIndex}]`;
                        }
                        else if (ids.type === 'contra') {
                            pathZurSuche += `.contraComments[${ids.commentIndex}]`;

                        }
                    }
                    else if (i === 2) {
                        pathZurSuche += `.replies[${ids.replyIndex1}]`;

                    }

                    else if (i > 2) {
                        let läufer = 2;
                        pathZurSuche += `.replies[${ids['replyIndex' + läufer]}]`;
                        läufer++
                    }

                }
                // Speichern des gefundenen Objekts im entsprechenden Array basierend auf der Ebene
                let nestedreply = eval(pathZurSuche);
                if (anzahleindexes === 1) {
                    topicsSuche.push(nestedreply);
                } else if (anzahleindexes === 2) {
                    commentSuche.push(nestedreply);
                } else if (anzahleindexes === 3) {
                    replySuche.push(nestedreply);
                } else if (anzahleindexes > 3) {
                    nestedReplySuche.push(nestedreply);
                }

                // Hier sollten Sie jetzt Zugriff auf die gewünschten Kommentare haben
            });
        }


        getLastElementFromPath();



        const repliescreatedCommentsList = computed(() => {
            return repliescreated.value.map(commentId => {
                return store.getters.getCommentById(commentId);

            });
        });

        const procreatedCommentList = computed(() => {
            return procreatedComments.value.map(commentId => {
                const comment = store.getters.getCommentById(commentId);


                return comment;
            });
        });

        const contracreatedCommentsList = computed(() => {
            return contracreatedComments.value.map(commentId => {
                const comment = store.getters.getCommentById(commentId);

                return comment;
            });
        });

        const TopicDownVotes = computed(() => {
            return currentUser.value.hasdislikedtopic.map(commentId => {
                return store.getters.getTopicById(commentId);

            });
        });


        const TopicUpVotes = computed(() => {
            return currentUser.value.haslikedtopic.map(commentId => {
                return store.getters.getTopicById(commentId);

            });
        });



        const showDropdown = ref(false);

        const toggleDropdown = () => {
            showDropdown.value = !showDropdown.value;
        };


        return {
            iconColor,
            currentUser,
            showDropdown,
            toggleDropdown,
            procreatedCommentList,
            contracreatedCommentsList,
            state,
            repliescreatedCommentsList,
            TopicUpVotes,
            TopicDownVotes,
            showreply,
            topicsSuche,
            replySuche,
            commentSuche,
            nestedReplySuche,
            bookmarkrouting,


        };
    },



}


</script>

<style scoped>
.following-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-size: 25px;
    border: none;
    padding-left: 0;
    background: transparent;
}

.background-image {
    position: absolute;

    left: 0;
    width: 100%;
    height: 150px;
    transform: translateY(-50%);
    /* Korrekte Zentrierung */
    background-image: url('https://www.optikunde.de/farbe/image/rot.png');
    background-size: cover;
    z-index: -1;
    /* Hinter dem Rest des Inhalts */
}

.profile-page {
    padding: 10px;
}

.settings-container {

    padding: 10px
}

img {
    border-radius: 80px;
    width: 90px;
    height: 90px;
    display: flex;

}



.settings-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 6px;
}


.follow-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
}

.follow-container p {
    margin: 0;
    gap: 10px;
}

.profile-content {
    display: flex;
    align-items: center;
    padding-left: 10px;
}

.profile-content h5 {

    margin: 0;
    display: flex;
    font-size: 22px;
    padding-top: 5px;
}

.profile-content p {

    margin: 0;
    font-size: 13px;
    display: flex;
    padding-top: 5px;
    gap: 5px;
}

.Buttons-profilepage {
    width: 25px;
    height: 25px;
}



.profile-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
    font-size: 25px;
    border: none;
    background: transparent;
}

.profile-button h3 {
    font-size: 15px;
}

.bookmark-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
    font-size: 25px;
    border: none;
    background: transparent;
}

.bookmark-button h3 {
    font-size: 15px;
}



.friends-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
    font-size: 25px;
    border: none;
    background: transparent;

}

.friends-button h3 {
    font-size: 15px;
}

.logout-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
    font-size: 25px;
    border: none;
    background: transparent;

}


.logout-button .icon {
    font-size: 25px;
    /* Größeres Icon für Sichtbarkeit */
}

.logout-button h3 {
    font-size: 15px;
}


/* DropdownMenu */
.settings-container {
    position: relative;
    /* Damit das Dropdown-Menü relativ zu diesem Container positioniert wird */
}

.settings-button {
    background: none;
    border: none;
    cursor: pointer;
}

.dropdown {
    position: absolute;
    top: 100%;
    /* Direkt unter dem Button positionieren */


}

.dropdown-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.dropdown-menu li {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.dropdown-menu li:hover {
    background-color: #ffffff;
}



.comment-box:last-child {
    border-bottom: 1px solid #ccc;
    border-left: none;
}

.comment-reply {
    border-left: none;
    border-bottom: #ccc 1px solid;
    margin-top: 10px;
}
</style>