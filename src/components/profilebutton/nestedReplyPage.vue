<template>
  <div class="topic-container">
    <!-- Laden und Anzeigen von Themen -->
    <div v-if="topic" class="topic-ganzeseite">
      <!-- <div class="author-info">
        <img :src="author.profileImage" alt="Author Profile Image" class="author-image" />
        <span class="author-name">{{ author.name }}</span>
      </div> -->
      <div class="topic-content">
        <p class="topic-text">{{ topic.text }}</p>
      </div>
    </div>
  </div>

  <CommentBox v-if="comment" :key="comment.id" :comment="comment" :topic="comment.topicId" />


 
  <CommentReply :key="reply.id" :reply="reply" :topic="topic.id" :commentId="comment.id"
   :commentIndex="reply.commentIndex" :id="reply.id"></CommentReply>

  <CommentReply :key="lastElement.id" :reply="lastElement" :topic="topic.id" :commentId="comment.id" 
    :commentIndex="lastElement.commentIndex" :id="lastElement.id"></CommentReply>
</template>


<script>
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
/* eslint-disable no-unused-vars */
import { computed, onBeforeMount, onMounted, onUnmounted } from 'vue';
import CommentReply from '../CommentReply.vue';
import CommentBox from '../CommentBox.vue';

export default {
  components: {
    CommentBox,
    CommentReply,
  },
    setup() {
    const store = useStore();
    const route = useRoute();
    const path = route.params.path;

    console.log(path)
    const topics = computed(() => store.state.topics)
    // Zerlegen Sie den Pfad in ein nutzbares Format
    const parsedPath = parsePath(path);

    // Holen Sie sich die benötigten Daten aus Ihrer Datenstruktur
    const { topic, comment, reply, lastElement } = getValuesFromPath(topics.value, parsedPath);

    return {
      topic,
      comment,
      reply,
      lastElement
    };
  }
};

function parsePath(path) {
  const parts = path.split('/').filter(part => part !== '');
  const parsed = [];
  for (let part of parts) {
    if (part.includes('_')) {
      const [type, index] = part.split('_');
      parsed.push(type === 'pro' ? 'proComments' : 'contraComments');
      parsed.push(Number(index));
    } else {
      parsed.push(Number(part));
    }
  }
  return parsed;
}

function getValuesFromPath(data, pathArray) {
  let current = data;
  const values = {
    topic: null,
    comment: null,
    reply: null,
    lastElement: null
  };

  // Erstes Element ist das Hauptthema
  values.topic = current[pathArray[0]];

  // Zweites Element ist der Pro- oder Contra-Kommentar
  if (pathArray[1].includes('pro')) {
    values.comment = values.topic.proComments[parseInt(pathArray[2])];
  } else {
    values.comment = values.topic.contraComments[parseInt(pathArray[2])];
  }

  // Drittes Element ist die erste Antwort
  values.reply = values.comment.replies[pathArray[3]];

  // Viertes Element ist die zweite Antwort
  const secondReply = values.reply.replies[pathArray[4]];

  // Fünftes Element ist die dritte Antwort (falls vorhanden)
  if (pathArray.length > 5) {
    values.lastElement = secondReply.replies[pathArray[5]];
  } else {
    values.lastElement = secondReply;
  }

  return values;
}
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
