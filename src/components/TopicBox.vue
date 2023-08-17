//TopicBox.vue

<template>

  <div v-if="topic" class="topic-box">
    <div class="topic-content" @click="goToTopic">
  <img :src="topic.image" alt="Topic image" class="topic-image" />
  <h2 class="topic-title">{{ topic.title }}</h2>
  <p class="topic-text">{{ topic.text }}</p>
</div>
    <div class="like-bar">
      <div
        class="section"
        v-for="group in sortedGroups"
        :key="group"
        :style="{ width: groupWidths[group] + '%', backgroundColor: groupColors[group] }"
        @click="showPopup(group)"
      >
        <div v-if="popupGroup === group" class="popup">
          {{ groupWidths[group] }}%
        </div>
      </div>
    </div>

    <!--Like Button-->
    <div class="interaction-bar">
      <button 
        ref="likeButton"
        @click="like(1)" 
        :style="{ color:iconColor(currentUser.party) }" 
        class="like-button" 
        :class="{ liked: userHasLiked }">
        <font-awesome-icon :key="userHasLiked" :icon="[userHasLiked ? 'fas' : 'far', 'thumbs-up']" class="icon" />
      </button>
      <!--Konversation Button-->
    <div class="conversation-prompt">
     <button @click="goToTopic"  :style="{ color: iconColor(currentUser.party)}" class="join-button"><span>Join the Conversation now!
       <font-awesome-icon :icon="['far', 'comments']" class="icon" @click="goToTopic"/>  </span>
      </button>
     
    </div>

  </div>
  </div>
  <div v-else>
    <!-- Placeholder content while topic is loading, or error message if topic couldn't be loaded -->
    <p>Loading topic...</p>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { iconColor } from './farben';
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed } from 'vue'; /// Importiere das computed-Hook



export default {

  setup() {
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);



    
    return {
      iconColor,
      currentUser, // Mache den currentUser verfügbar
    };
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['getTopicById']),

    userHasLiked() {
    return this.$store.state.userLikes[this.currentUser.id] &&
      this.$store.state.userLikes[this.currentUser.id][this.id] === this.currentUser.party;
  },
  

    topic() {
      return this.getTopicById(this.id);
    },
    totalLikes() {
      // Überprüfen Sie, ob das "topic" Objekt definiert ist, bevor Sie auf "topic.likes" zugreifen
      if (!this.topic) return 0;

      return Object.values(this.topic.likes).reduce((sum, value) => sum + value, 0);
    },
    groupWidths() {
      // Überprüfen Sie, ob das "topic" Objekt definiert ist, bevor Sie auf "topic.likes" zugreifen
      if (!this.topic) return {};

      let widths = {};
      for (let group in this.topic.likes) {
        widths[group] = ((this.topic.likes[group] / this.totalLikes) * 100).toFixed(1);
      }
      return widths;
    },
    groupColors() {
      return {
        '-4': 'dodgerblue',
        '-3': 'cornflowerblue',
        '-2': 'deepskyblue',
        '-1': 'skyblue',
        '1': 'gold',
        '2': 'goldenrod',
        '3': 'orange',
        '4': 'red',
      };
    },
    sortedGroups() {
      return ['-4', '-3', '-2', '-1', '1', '2', '3', '4'];
    },
  },
  data() {
    return {
      popupGroup: null,
    };
  },
  methods: {
  ...mapMutations(['TOGGLE_LIKE']),

  like() {
  const userParty = this.currentUser.party;
  const userId = this.currentUser.id;
  this.TOGGLE_LIKE({ topicId: this.id, group: userParty, userId });

  // Animation
  const likeButton = this.$refs.likeButton;
  likeButton.animate([
    // keyframes
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    { transform: 'scale(1)' }
  ], {
    // timing options
    duration: 400,
    easing: 'ease-in-out'
  });
},
    getPartyColor(party) {
      return iconColor(party);
    },
    goToTopic(event) {
  const targetElement = event.target;

  // Überprüfen, ob auf das Bild oder die Box geklickt wurde
  if (
    targetElement.closest('.topic-image') ||
    targetElement.closest('.topic-content') ||
    targetElement.closest('.topic-title') ||
    targetElement.closest('.topic-text') ||
    targetElement.closest('.join-button') || 
    targetElement.closest('.interaction-bar')
  ) {
    this.$router.push(`/topic/${this.id}`);
  }
},
    
    // Vuex-Mutation zum Aktualisieren der Likes aufrufen

    showPopup(group) {
      this.popupGroup = group;
    },
    ...mapMutations(['UPDATE_LIKES']), // Füge die Mutation-Map hinzu, um die Vuex-Mutation aufzurufen
  },
};
</script>

<style lang="scss" >

.conversation-prompt{
  background-color: #ffffff;
}


button.like-button{
  background: white;
}

.topic-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #a39b9b;
}
.topic-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 20px auto;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  max-width: 75%;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  .topic-image {
    min-width: 80%;
   
    object-fit: cover;
  }

  .topic-title {
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }

  .topic-text {
    margin: 10px 0;
    text-align: justify;
    color: #333;
    
  }

  .like-bar {
    display: flex;
    width: 100%;
    height: 20px;
    margin: 10px 0;
    align-items: flex-end;

    .section {
      height: 100%;
      position: relative;

      .popup {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fff;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        color: #000;
      }
    }
  }

  .join-button{
    background-color: #fff;
    max-height: 20%;
  }

  button {
   
    border-radius: 5px;
    border: none;


    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;


  }
}
</style>
