//settingsComponent.vue
<template>
  <div class="profile-page">
    <div class="background-image"></div>
    <div class="settings-container">
      <button class="settings-button" @click="toggleDropdown">
        <font-awesome-icon :icon="['fas', 'bars']" class="icon" />
      </button>

      <div class="dropdown" v-if="showDropdown">
        <!-- Dropdown-Inhalt hier -->
        <ul class="dropdown-menu">

          <!--Bookmarks-->
          <li>
            <div class="bookmark-container">

              <button class="bookmark-button">
                <div class="Buttons-profilepage">
                  <font-awesome-icon :icon="['fas', 'bookmark']" class="icon"
                    :style="{ color: iconColor(currentUser.farbe) }" />
                </div>
                <h3>Bookmarks</h3>
              </button>
            </div>
          </li>


          <li>
            <div class="friends-container">
              <button class="friends-button">
                <div class="Buttons-profilepage">
                  <font-awesome-icon :icon="['fas', 'gear']" class="icon"
                    :style="{ color: iconColor(currentUser.farbe) }" />
                </div>
                <h3>Settings</h3>
              </button>
            </div>

          </li>
          <li>
            <button class="logout-button">

              <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="icon"
                :style="{ color: iconColor(currentUser.farbe) }" />
              <h3>Sign Out</h3>
            </button>
          </li>
        </ul>
      </div>
    </div>



    <img :src="currentUser.profileImage" alt="Profilbild" class="profile-image">



    <div class="profile-content">


      <div>
        <h5>{{ currentUser?.name }}</h5>
        <p>{{ currentUser?.bio }}</p>
        <p> <font-awesome-icon :icon="['far', 'calendar-days']" class="icon" /> {{ " " + 'Joined ' + currentUser?.joinedAt
        }}
        </p>
        <div class="follow-container">
          <button class="following-buttons">
            <p>{{ currentUser?.following.length + ' Following' }}</p>
          </button>

          <button class="following-buttons">
            <p>{{ currentUser?.followers.length + ' Followers' }}</p>
          </button>
        </div>

      </div>

    </div>

    <SwipeProfilComponentVue>


      <template #comments>
        <div>
          <button @click="test">test</button>
          <div v-for="comment in procreatedCommentList"  :key="comment.id">
            <!-- Hier kannst du die Inhalte der procreated Topics anzeigen -->
            <CommentBox :comment="comment" :topic="comment.topicId"  />
          </div>
          <div v-for="comment in contracreatedCommentsList" :key="comment.id" :topic="comment.topicId">
            <!-- Hier kannst du die Inhalte der contracreated Topics anzeigen -->
            <CommentBox :comment="comment" :topic="comment.topicId" />
          </div>
        </div>
      </template>


      <!-- Inhalte für den "Replies"-Tab -->
      <template #replies>
        <div>
          <div v-for="reply in repliescreatedCommentsList" :key="reply.id" >
            <!-- Hier kannst du die Inhalte der Antworten anzeigen -->
            <CommentReply :reply="reply" :topic="reply.topicId" />
          </div>
        </div>
      </template>

      <!-- Inhalte für den "Likes"-Tab -->
      <template #votes>
        <div>
          <div v-for="topic in TopicUpVotes" :key="topic.id" :id="topic.id">
            <TopicBox :key="topic.id" :id="topic.id" />
          </div>

        </div>
        <div>
          <div v-for="topic in TopicDownVotes" :key="topic.id" :id="topic.id">
            <TopicBox :key="topic.id" :id="topic.id" />
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
import state from 'vue'
import CommentBox from '../CommentBox.vue'
import CommentReply from '../CommentReply.vue'
import TopicBox from '../TopicBox.vue'; // Hier importiere TopicBox

export default {
  components: {
    SwipeProfilComponentVue,
    CommentBox,
    CommentReply,
    TopicBox,
  },
  setup() {

    const currentUser = computed(() => store.state.currentUser);

    const test = () => {
  
};
    const store = useStore(); // Erhalte Zugriff auf den Vuex-Store

    const procreatedComments = computed(() => currentUser.value.procreated);
    const contracreatedComments = computed(() => currentUser.value.contracreated);
    const repliescreated = computed(() => currentUser.value.createdReplies)

    const repliescreatedCommentsList = computed(() => {
      return repliescreated.value.map(commentId => {
        return store.getters.getCommentById(commentId);

      });
    });

   const procreatedCommentList = computed(() => {
  return procreatedComments.value.map(commentId => {
   const comment = store.getters.getCommentById(commentId);
    console.log(comment);
   
    return comment;
  });
});

const contracreatedCommentsList = computed(() => {
  return contracreatedComments.value.map(commentId => {
    const comment = store.getters.getCommentById(commentId);
    console.log(comment); // Füge diese Zeile hinzu
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
     test
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
</style>