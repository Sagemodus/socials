
<template>

<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <div v-if="topic" class="topic-box">
  <div class="author-info">
    <img :src="topic.createdBy.profileImage" alt="Author Profile Image" class="author-image" />


    <!--Share button-->
    <button @click="shareContent">Teilen</button>

    <span class="author-name" style="line-height: 0.8;">{{ topic.createdBy.name }} <br>
  <p style="font-weight: bold; font-size: 12px;" class="topic-text">{{ ' ' + topic.category.sub }}</p></span>
   
  </div>
  <div class="topic-content" @click="goToTopic">
    <p class="topic-text">{{ topic.text }}</p>
  </div>

  

    <div class="balken">
  <div
    class="like-bar"
    :class="{ liked: topic.hasUpvoted || topic.hasDownvoted }"
    :style="{ width: topic.likes.upvotePercentage + '%' }"
  >
    <p v-if="topic.hasUpvoted || topic.hasDownvoted" class="bar-text">{{ topic.likes.upvotePercentage + '%' }}</p>
  </div>
  <div
    class="dislike-bar"
    :class="{ disliked: topic.hasUpvoted || topic.hasDownvoted }"
    :style="{ width: topic.likes.downvotePercentage + '%' }"
  >
    <p v-if="topic.hasUpvoted || topic.hasDownvoted" class="bar-text">{{ topic.likes.downvotePercentage + '%' }}</p>
  </div>
</div>
  

    <!--Like Button-->
    <div class="interaction-bar">

      <div class="vote">

        <button @click="like" class="like-button" ref="likeButton">
        <font-awesome-icon
        :icon="topic.hasUpvoted ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" 
        class="icon"
        :style="{ color: iconColor(currentUser.farbe) }" />
          
     
        <p :style="{ color: iconColor(currentUser.farbe) }">{{ this.topic.likes.upvotes }}</p>
      </button>
      <button @click="dislike" class="like-button" ref="dislikeButton">
        <font-awesome-icon
        :icon="topic.hasDownvoted ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" 
          class="icon"
          :style="{ color: iconColor(currentUser.farbe) }"
        />
        <p :style="{ color: iconColor(currentUser.farbe) }">{{ this.topic.likes.downvotes }}</p>
      </button>



      </div>

      <!--Konversation Button-->
    <div class="conversation-prompt">
     <button @click="goToTopic"  :style="{ color: iconColor(currentUser.farbe)}" class="join-button"><span>Join the Conversation now!
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
import {  computed } from 'vue';


export default {
  components: {
    
  },
  setup() {
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);



    
    return {
      iconColor,
      currentUser, // Mache den currentUser verfügbar
      topicUrl:  '',

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


  

 

    topic() {
      return this.getTopicById(this.id);
    },
   
  },
  data() {
    return {
      popupGroup: null,
    };
  },

  
  methods: {
    ...mapMutations(['TOGGLE_LIKE', 'TOGGLE_DISLIKE']), // Import mutations
       // Funktion zum Umschalten der Prozentanzeige
  
    // Funktion zur Berechnung des Prozentsatzes
    shareContent() {
  const shareData = {
    title: 'Teilen über...',
    text: 'Der Inhalt, den du teilen möchtest.',
    url: this.getTopicUrl(),
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => {
        console.log('Inhalt erfolgreich geteilt.');
      })
      .catch((error) => {
        console.error('Fehler beim Teilen:', error);
      });
  } else {
    console.warn('Der Browser unterstützt den "Native Share" nicht.');
  }
},





    getTopicUrl() {
    return this.$router.resolve(`/topic/${this.id}`).href;
  },
   

    animateButton(buttonRef) {
      const button = buttonRef;
      button.animate(
        [
          // keyframes
          { transform: 'scale(1)' },
          { transform: 'scale(1.3)' },
          { transform: 'scale(1)' }
        ],
        {
          // timing options
          duration: 400,
          easing: 'ease-in-out'
        }
      );
    },


    dislike() {
      const userId = this.currentUser.id;
      this.TOGGLE_DISLIKE({ topicId: this.id, userId });
      this.$nextTick(() => {
        this.animateButton(this.$refs.dislikeButton);
      });
    },

  like() {
      const userId = this.currentUser.id;
      this.TOGGLE_LIKE({ topicId: this.id, userId });
      this.$nextTick(() => {
        this.animateButton(this.$refs.likeButton);
      });
    },
    getfarbeColor(farbe) {
      return iconColor(farbe);
    },
    goToTopic(event) {
  const targetElement = event.target;

  // Überprüfen, ob auf das Bild oder die Box geklickt wurde
  if (
    targetElement.closest('.topic-image') ||
    targetElement.closest('.topic-content') ||
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



.bar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  color:white;
}



.like-bar,
.dislike-bar {
  height: 10px;
  transition: width 0.3s ease-in-out;

}

.balken {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 10px;
  width: 100%;
  height: 20px;

  .like-bar,
  .dislike-bar {
    height: 100%;
    width: 50%;
    transition: background-color 0.3s ease-in-out;
  }

  .like-bar {
    background-color: grey; /* Anfangsfarbe */
    &.liked {
      background-color: green; /* Bei Like */
    }
  }

  .dislike-bar {
    background-color: grey; /* Anfangsfarbe */
    &.disliked {
      background-color: red; /* Bei Dislike */
    }
  }
}





.conversation-prompt{
  background-color: #ffffff;
}


button.like-button{
  background-color: transparent;
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
padding: 10px;
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

  

  .topic-text {
    margin: 10px 0;
    text-align: justify;
    color: #333;
    
  }


  .join-button{
    background-color:transparent;
    max-height: 20%;
  }

  button {
   
    border-radius: 5px;
    border: none;


    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    

  }

  .vote {
    display: flex;
    justify-content: space-around;
    p{
      margin-left: 0.5em;
      font-size: 15px;
    }
}


.author-info {
  width: 100%; /* Ensure the author-info takes up the entire width */
  display: flex;
  align-items: center;

 
}

.author-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
 
}

.author-name {
  font-weight: bold;
  padding-left: 1em;
  padding-top: 1em;
}

.topic-content {
  flex: 1; /* Allow topic-content to take up remaining space */
  
}
@media only screen and (max-width: 600px) {
  .topic-box .author-info {
    display: flex;
    align-items: center;
  }

  .author-image {
    width: 30px; /* Set a smaller width for the image */
    height: 30px; /* Set a smaller height for the image */
  }

  .author-name {
    font-weight: bold;
    padding-left: 0.5em; /* Adjust padding for the name */
  }

  

  .percentage-display {
  text-align: center;
  margin-top: 10px;
}
.balken {
    min-width: 10em;
    display: flex;
}

}
}

button:active,
button:focus {
  background-color: transparent;
  outline: none; /* Entfernt den fokussierten Rahmen um den Button */
}

</style>