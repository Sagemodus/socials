<template>
  <div class="header">

    <button class="zurück-button" @click="$router.go(-1)"> <font-awesome-icon :icon="['fas', 'arrow-left']"
        size="lg" /></button>

  </div>
  <div class="nested-reply-page">


    <div class="topic-container">

      <div v-if="topic" class="topic-ganzeseite">
        <div class="author-info">
          <img :src="author.profileImage" alt="Author Profile Image" class="author-image" />
          <span class="author-name">{{ author.name }}</span>
        </div>
        <div class="topic-content">
          <p class="topic-text">{{ topic.text }}</p>
        </div>
      </div>
    </div>

    <CommentBox v-if="comment" :key="comment.id" :comment="comment" :topic="comment.topicId" />



    <CommentReply :key="reply.id" :reply="reply" :topic="topic.id" :commentId="comment.id"
      :commentIndex="reply.commentIndex" :id="reply.id"></CommentReply>

    <div v-if="lastElement.replytype == 'nested'">
      <CommentReply :key="lastElement.id" :reply="lastElement" :topic="topic.id" :commentId="comment.id"
        :commentIndex="lastElement.commentIndex" :id="lastElement.id"></CommentReply>
    </div>


  </div>
</template>


<script>
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
/* eslint-disable no-unused-vars */
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue';
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
    const topics = computed(() => store.state.topics);
    const path = ref(route.params.path || ''); // Verwenden Sie ref, um path reaktiv zu machen


    let parsedPath = parsePath(path.value);
    let values = getValuesFromPath(topics.value, parsedPath);


    const topic = ref(values.topic);
    const comment = ref(values.comment);
    const reply = ref(values.reply);
    const lastElement = ref(values.lastElement);
    const author =
      store.getters.getUserById(topic.value.author);
    // Beobachten Sie Änderungen der Route
    watch(route, () => {
      path.value = route.params.path;
      if (path.value) {
        parsedPath = parsePath(path.value);
        values = getValuesFromPath(topics.value, parsedPath);
      }

      topic.value = values.topic;
      comment.value = values.comment;
      reply.value = values.reply;
      lastElement.value = values.lastElement;
    });




    return {
      topic,
      comment,
      reply,
      lastElement,
      author
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
    current = values.topic.proComments[parseInt(pathArray[2])];
  } else {
    current = values.topic.contraComments[parseInt(pathArray[2])];
  }
  values.comment = current;

  // Drittes Element ist die erste Antwort
  if (pathArray.length > 3) {
    current = current.replies[pathArray[3]];
    values.reply = current;
  }

  // Viertes Element und darüber hinaus
  for (let i = 4; i < pathArray.length; i++) {
    current = current.replies[pathArray[i]];
  }
  values.lastElement = current;
  return values;
}
</script>


<style scoped>
svg.svg-inline--fa.fa-arrow-left.fa-lg {
  height: 16px;
  width: 15px;
}

.header {
  background-color: white;
  position: fixed;
  height: 35px;
  display: flex;
  min-width: 100%;
  flex-direction: row;
  align-items: center;

}

button.zurück-button {
  display: flex;
  background-color: transparent;
  border: none;
  position: sticky;
  padding-left: 10px;
  padding-top: 1px;
}


.nested-reply-page {
  padding: 5px;
  padding-top: 25px;
  padding-bottom: 0px;
}

p.topic-text {
  font-size: 16px;
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
