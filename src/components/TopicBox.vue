
<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <div v-if="topic" class="topic-box">
    <div class="author-info">
      <div class="left-content">
        <div class="profilbild" @click="goToProfile(topic.author.id)">
          <img :src="topic.author.profileImage" alt="Author Profile Image" class="author-image" />
        </div>
        <div class="author">

        </div>
        <div class="author-category">
          <span class="author-name" style="line-height: 0.8;">{{ topic.author.name }} </span>
          <p style=" font-size: 11px;" class="topic-text">{{ ' ' + topic.category.sub }}</p>
        </div>



      </div>

      <!--Buttons oben rechts-->
      <div class="right-content">
        <p>{{ $store.getters.formattedCreatedAt(topic.createdAt) }}</p>
        <button class="share-button" @click="shareContent">
          <font-awesome-icon :icon="['fas', 'share-nodes']" class="icon"
            :style="{ color: iconColor(currentUser.farbe) }" />
        </button>
        <!--Save Button-->
        <button @click="saveChanges" class="savebutton">

          <font-awesome-icon :icon="isSaved(topic.path) ? ['fas', 'bookmark'] : ['far', 'bookmark']" class="icon"
            :style="{ color: iconColor(currentUser.farbe) }" />
        </button>


      </div>


    </div>


    <div class="topic-content" @click="goToTopic">
      <p class="topic-text">{{ topic.text }}</p>
    </div>


    <div class="balken">
      <div class="like-bar" :class="{ liked: hasLikedTopic || hasDislikedTopic }"
        :style="{ width: topic.upvotePercentage + '%' }" :title="topic.upvotePercentage + '%'" :interactive="true">
        <p v-if="hasLikedTopic || hasDislikedTopic" class="bar-text">{{ topic.upvotePercentage + '%' }}</p>
      </div>
      <div class="dislike-bar" :class="{ disliked: hasLikedTopic || hasDislikedTopic }"
        :style="{ width: topic.downvotePercentage + '%' }" :title="topic.downvotePercentage + '%'" :interactive="true">
        <p v-if="hasLikedTopic || hasDislikedTopic" class="bar-text">{{ topic.downvotePercentage + '%' }}</p>
      </div>
    </div>


    <!--Like Button-->
    <div class="interaction-bar">

      <div class="vote">

        <button @click="like" class="like-button">
          <font-awesome-icon :icon="hasLikedTopic ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" class="icon"
            :style="{ color: iconColor(currentUser.farbe) }" />
          <p :style="{ color: iconColor(currentUser.farbe) }">{{ topic.upvotes }}</p>
        </button>
        <button @click="dislike" class="like-button">
          <font-awesome-icon :icon="hasDislikedTopic ? ['fas', 'thumbs-down'] : ['far', 'thumbs-down']" class="icon"
            :style="{ color: iconColor(currentUser.farbe) }" />
          <p :style="{ color: iconColor(currentUser.farbe) }">{{ topic.downvotes }}</p>
        </button>



      </div>

      <!--ConPro Button-->
<div v-if="!disableelements"   class="disableFromBookmark">
      <div class="tab-selection">
        <button @click="updateTabAndColor('pro')" :class="{ 'active-tab': selectedTab === 'pro' }">Pro</button>
        <button @click="updateTabAndColor('contra')" :class="{ 'active-tab': selectedTab === 'contra' }">Contra</button>

      </div>


 <div v-if="selectedTab === 'pro'" class="kommentare">
        <CommentBox v-for="comment in sortedComments('pro').slice(0, 2)" :key="comment.id" :comment="comment"
          :topic="id" />
      </div>

      <div v-else-if="selectedTab === 'contra'" class="kommentare">
        <CommentBox v-for="comment in sortedComments('contra').slice(0, 2)" :key="comment.id" :comment="comment"
          :topic="id" />
      </div>
      <!-- Anzeige, wenn keine Kommentare vorhanden sind -->
      <div v-else>
        <p>Noch keine Kommentare vorhanden.</p>
      </div>



      <!--Konversation Button-->
      <div class="conversation-prompt">
        <button @click="goToTopic" :style="{ color: iconColor(currentUser.farbe) }" class="join-button"><span>Show more
            <font-awesome-icon :icon="['far', 'comments']" class="icon" @click="goToTopic" /> </span>
        </button>

      </div>



</div>
     

    </div>
  </div>

  <!---->














  <div v-else>
    <!-- Placeholder content while topic is loading, or error message if topic couldn't be loaded -->
    <p>Loading topic...</p>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import { iconColor } from './farben';
import { useStore } from 'vuex'; // Importiere das useStore-Hook
import { computed, watchEffect } from 'vue';
import { onMounted } from 'vue';
import CommentBox from './CommentBox';
import { useRouter } from 'vue-router';


export default {
  components: {
    CommentBox,

  },

  setup(props) {




    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store
    const router = useRouter();

   
    const topic = computed(() => store.getters.getTopicById(props.id));
    // Zugriff auf den currentUser aus dem Vuex-Store
    const currentUser = computed(() => store.state.currentUser);

    const selectedTab = computed(() => store.state.selectedTab);
    const selectedTabColor = computed(() => store.state.selectedTabColor);
  

    watchEffect(() => {
      document.documentElement.style.setProperty('--selectedTabColor', selectedTabColor.value);
    });

    const isBarTooSmall = computed(() => {
      const minWidthThreshold = 10;
      return (
        props.topic.upvotePercentage < minWidthThreshold ||
        props.topic.downvotePercentage < minWidthThreshold
      );
    });
    const goToProfile = () => {
      router.push(`/profile/${topic.value.author.id}`);
    }

    



    return {
      iconColor,
      currentUser, // Mache den currentUser verfügbar
      topicUrl: '',
      selectedTab,
      selectedTabColor,
      isBarTooSmall,
      onMounted,
      goToProfile,
      topic,
    };
  },

  props: {
    id: {
      type: String,
      required: true,
    },
    disableelements: {

    },
  },
  computed: {
    ...mapGetters(['getTopicById']),


    hasLikedTopic() {
      return this.currentUser.haslikedtopic.includes(this.topic.id);
    },
    hasDislikedTopic() {
      return this.currentUser.hasdislikedtopic.includes(this.topic.id);
    },
    sortedComments() {
      return (type) => {
        const commentType = type === 'pro' ? 'proComments' : 'contraComments';
        return this.topic[commentType]
          .slice()
          .sort((a, b) => b.upvotes - a.upvotes);
      };
    },





  },
  data() {
    return {
      popupGroup: null,
    };
  },


  methods: {
    ...mapMutations(['TOGGLE_LIKE', 'TOGGLE_DISLIKE', 'ADD_TOPIC_TO_SAVES',]), // Import mutations
    ...mapActions(['fetchComments', 'addCommentToTopic', 'selectTab',]),


    updateTabAndColor(tab) {

      this.$store.dispatch('selectTab', tab); // Action aufrufen
      this.$store.dispatch('updateSelectedTabColor'); // Action aufrufen
    },



    //Save button logik
    saveChanges() {
      this.ADD_TOPIC_TO_SAVES(this.topic.path);

    },
    isSaved(topicId) {
      return this.$store.getters.isTopicSaved(topicId);
    },

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


    animateButton(target) {
      target.animate(
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


    dislike(event) {
      const userId = this.currentUser.id;
      this.TOGGLE_DISLIKE({ topicId: this.id, userId });
      const dislikeButton = event.target;
      this.animateButton(dislikeButton);
    },

    like(event) {
      const userId = this.currentUser.id;
      this.TOGGLE_LIKE({ topicId: this.id, userId });
      const likeButton = event.target;
      this.animateButton(likeButton);
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
.tab-selection {
  display: flex;
  justify-content: space-evenly;
  background-color: white;


  button {
    padding: 10px 20px;
    font-size: 16px;
    color: #333;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: transparent;
      transition: background-color 0.3s ease;
    }





    &.active-tab {
      color: var(--selectedTabColor);
      font-weight: bold;

      &:before {
        background-color: var(--selectedTabColor);
      }
    }
  }
}



.tab-content-enter-active,
.tab-content-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.tab-content-enter,
.tab-content-leave-to

/* .tab-content-leave-active in <2.1.8 */
  {
  opacity: 0;
}

.savebutton {
  background-color: transparent;
}

.right-content {
  display: flex;
  flex-direction: row;
  min-width: 15%;
  justify-content: flex-end;
  gap: 10px;

}

.author-category {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 1em;

}



.save-button {
  background-color: transparent;
}


.bar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  color: white;
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
    background-color: grey;

    /* Anfangsfarbe */
    &.liked {
      background-color: green;
      /* Bei Like */
    }
  }

  .dislike-bar {
    background-color: grey;

    /* Anfangsfarbe */
    &.disliked {
      background-color: red;
      /* Bei Dislike */
    }
  }
}





.conversation-prompt {
  background-color: transparent;
}


button.like-button {
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
  padding: 8px;
  margin: 10px auto;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 15px 20px rgba(1, 18, 251, 0.1);
  max-width: 90%;
  transition: transform 0.3s ease-in-out;




  .topic-image {
    min-width: 80%;

    object-fit: cover;
  }



  .topic-text {
    margin: 10px 0;
    text-align: justify;
    color: #333;


  }


  .join-button {
    background-color: transparent;
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

    p {
      margin-left: 0.5em;
      font-size: 15px;
    }
  }




  .author-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;

  }

  .author-name {
    font-weight: bold;
    font-size: 20px;
    padding-top: 1em;
  }

  .topic-content {
    flex: 1;
    /* Allow topic-content to take up remaining space */

  }

  @media only screen and (max-width: 600px) {
    .right-content {
      width: 30%;
      display: flex;
      justify-content: flex-end;
    }

    .topic-box .author-info {
      display: flex;
      align-items: center;

    }

    .author-image {
      width: 50px;
      /* Set a smaller width for the image */
      height: 50px;
      /* Set a smaller height for the image */
    }




    .percentage-display {
      text-align: center;
      margin-top: 10px;
    }

    .balken {
      min-width: 10em;
      display: flex;
    }

    .left-content {
      width: 85%;
    }

  }

  // ende von mediascreen
}

button:active,
button:focus {
  background-color: transparent;
  outline: none;
  /* Entfernt den fokussierten Rahmen um den Button */
}

.author-info {

  width: 100%;
}

button.share-button {
  max-width: 30%;
  min-width: 30%;
  text-align: right;
  justify-content: space-evenly;
  background-color: transparent;
}

/* Füge folgende Regel hinzu, um die Elemente auf einer Zeile anzuzeigen */
.topic-box .author-info,
.topic-box .share-button {
  flex: 1;
  display: flex;
  align-items: center;

}

.profilbild {
  height: 100%;
}

.left-content {

  display: flex;
  align-items: center;
  min-width: 85%;
}
</style>