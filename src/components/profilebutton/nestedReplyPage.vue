<template>
  <div class="topic-container">
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-ganzeseite">
      <div class="author-info">
        <img :src="topic.author.profileImage" alt="Author Profile Image" class="author-image" />
        <span class="author-name">{{ topic.author.name }}</span>
      </div>
      <div class="topic-content">
        <p class="topic-text">{{ topic.text }}</p>
      </div>
    </div>
  </div>

  <CommentBox v-if="comment" :key="comment.id" :comment="comment" :topic="comment.topicId" />


  <!-- Laden und Anzeigen von Elterelement der Antworten -->
  <CommentReply :key="replyEltern.id" :reply="replyEltern" :topic="topic.id" :commentId="comment.id"
    :commentobjekt="comment" :commentIndex="replyEltern.commentIndex" :id="replyEltern.id"></CommentReply>
  <!-- Laden und Anzeigen von Antworten -->
  <CommentReply :key="reply.id" :reply="reply" :topic="topic.id" :commentId="comment.id" :commentobjekt="comment"
    :commentIndex="reply.commentIndex" :id="reply.id"></CommentReply>
</template>


<script>
import { useStore } from 'vuex';
import { computed, onBeforeMount, onMounted} from 'vue';
import CommentReply from '../CommentReply.vue';
import CommentBox from '../CommentBox.vue';

export default {
  components: {
    CommentBox,
    CommentReply,
  },
  setup() {

    const store = useStore();
    const comment = store.state.comment;
    const reply = store.state.reply;
    const topicId = comment.topicId;
    const topic = computed(() => store.getters.getTopicById(topicId));
    const topics = computed(() => store.state.topics);


    onBeforeMount(() => {
      comment.expandReplies = false;
    });




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
      const path = reply.path;
      const ids = parseId(path); // Verwende die parseId Funktion, um die IDs zu extrahieren
      const anzahleindexes = Object.keys(ids).length -2;



      let pathZurSuche = "";

      for (let i = 0; i < anzahleindexes; i++) {
        // Schleife durch die IDs
        if (i === 0) {
          pathZurSuche = `topics.value[${ids.topicIndex}]`;

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

    }


    getLastElementFromPath();

    function parseId(path) {
      const parts = path.split('/').filter(part => part !== ''); // Entferne leere Teile
      const ids = {
        topicIndex: parts[0],
        type: parts[1].split('_')[0],
        commentIndex: parts[1].split('_')[1],
      };

      // Dieses -1 entfernt das letzte objekt sodass ich das 2. letzte objekt verwenden kann
      for (let i = 2; i < parts.length; i++) {
        ids['replyIndex' + (i - 1)] = parts[i];
      }

      return ids;
    }

    const replyEltern = replySuche[0] || commentSuche[0] || topicsSuche[0] || nestedReplySuche[0];



    onMounted(() => {
      replyEltern.expandReplies = false;
    });



    return {
      topic,
      reply,
      comment,
      topicsSuche,
      replySuche,
      commentSuche,
      nestedReplySuche,
      replyEltern,

    };

  },
};





</script>

<style scoped>
p.topic-text {
  font-size: 16px;
  line-height: 1.5;
  text-align: justify;
  padding: 10px;
  padding-top: 0px;
  margin-top: 0;
  margin-bottom: 0;
}

.topic-container {
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 10px;
}


.author-info {
  display: flex;
  align-items: center;

}

.author-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.author-name {
  font-weight: bold;
}

.topic-content {
  margin-top: 10px;
}
</style>
