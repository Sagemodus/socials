<template>
  <div>
      <TopicBox
          v-for="topic in topicsSuche"
          :key="topic.id"
          :id="topic.id"
          :disableelements ="true"
        />
  </div>
</template>

<script>


import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { computed } from 'vue';
import TopicBox from '../TopicBox.vue';

export default {
      components: {
        TopicBox,
    },


    setup() {
        const store = useStore();
        const route = useRoute();
        const userId = route.params.userId;
       /*eslint-disable*/ 
        const topics = store.state.topics
        /*eslint-enable*/
        
        const bookmarkPathArray = computed(() => {

            return store.state.users[userId-1].topicsaves;
        }
        );



        const parseId = (element) => {
            const parts = element.split('/').filter(part => part !== ''); // Entferne leere Teile
            const ids = {
                topicIndex: parts[0],
                type: parts[1]?.split('_')[0],
                commentIndex: parts[1]?.split('_')[1],
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
            bookmarkPathArray.value.forEach(path => {
                const ids = parseId(path); // Verwende die parseId Funktion, um die IDs zu extrahieren
                const anzahleindexes = Object.keys(ids).length - 2;


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
                    let lauf = 0;

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


        return {
            topicsSuche,
            nestedReplySuche,
            replySuche,
            commentSuche,
    };
  },
};
</script>

<style>
/* Deine CSS-Stile hier */
</style>
