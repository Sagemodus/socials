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

              <button class="bookmark-button" @click="bookmarkrouting">
                <div class="Buttons-profilepage">
                  <font-awesome-icon :icon="['fas', 'bookmark']" class="icon"
                    :style="{ color: iconColor(currentUser.farbe) }" />
                </div>
                <h3>Bookmarks</h3>
              </button>
            </div>
          </li>
          <li>
            <button class="setting-button" @click="toggleSettings">
              <font-awesome-icon :icon="['fas', 'gear']" :style="{ color: iconColor(currentUser.farbe) }" />
              <h3>Settings</h3>
            </button>
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

      <div class="settings-modal" v-if="showSettings">
                    <button @click="toggleSettings" class="back-button"><font-awesome-icon :icon="['fas', 'arrow-left']"
                      size="lg" /></button>
        
        <h2>Einstellungen</h2>
        <div class="buttons-setting">
          <button class="button-4" role="button" @click="resetPassword">
            <font-awesome-icon :icon="['fas', 'key']" />
            Passwort zurücksetzen
          </button>
          <button class="button-4" role="button" @click="deleteAccount">
            <font-awesome-icon :icon="['fas', 'trash']" />
            Konto löschen
          </button>

        </div>
        <h5>You can reach us at
          Support@Companyname.com</h5>
      </div>


    </div>



    <img :src="currentUser.profileImage" alt="Profilbild" class="profile-image">


  <div class="profile-content">
    <div>
      <h5>{{ currentUser?.name }}</h5>
      <!-- Umschalten zwischen Anzeige und Bearbeitungsmodus -->
      <div class="edit-mode" v-if="!editMode">
        <p>{{ currentUser?.bio }}</p>
        <font-awesome-icon :icon="['fas', 'pencil-alt']" class="icon edit-icon" @click="enableEditMode"/>
      </div>
      <div v-else>
        <textarea v-model="editableBio" class="bio-edit"></textarea>
        <div class="edit-actions">
          <font-awesome-icon :icon="['fas', 'times']" class="icon cancel-icon" @click="disableEditMode"/>
          <font-awesome-icon :icon="['fas', 'save']" class="icon save-icon" @click="saveBio"/>
        </div>
      </div>
      <p> <font-awesome-icon :icon="['far', 'calendar-days']" class="icon" /> {{ " " + 'Joined ' + currentUser?.joinedAt }}</p>
    </div>
  </div>

    <SwipeProfilComponentVue>


      <template #comments>
        <div>
          <div v-for="comment in sortedCommentList" :key="comment.id">
            <!-- Hier kannst du die Inhalte der procreated Topics anzeigen -->
            <CommentBox :comment="comment" :topic="comment.topicId" :showreply="showreply" :anzeige="false" />
          </div>

        </div>
      </template>


      <!-- Inhalte für den "Replies"-Tab -->
      <template #replies>
        <comment-reply v-for="reply in replySuche.reverse()" :key="reply.id" :reply="reply"
          :topic="reply.topicId"></comment-reply>


      </template>

      <!-- Inhalte für den "Likes"-Tab -->
              <template #votes>
                  <div>
                      <div v-for="topic in TopicUpVotes" :key="topic.id" :id="topic.id">
                          <TopicBox :key="topic.id" :id="topic.id" :isUpVoted ="true" :disableelements ="true" />
                      </div>

                  </div>
                  <div>
                <div v-for="topic in TopicDownVotes.reverse()" :key="topic.id" :id="topic.id">
                  <TopicBox :key="topic.id" :id="topic.id" :disableelements="true" :isDownVoted="true" />
                </div>

                  </div>
              </template>




    </SwipeProfilComponentVue>


  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
import { useStore } from 'vuex';
import { computed } from 'vue';
import { iconColor } from '../farben';
import { ref } from 'vue';
import SwipeProfilComponentVue from '../SwipeProfilComponent.vue'
import CommentBox from '../CommentBox.vue'
import CommentReply from '../CommentReply.vue'
import TopicBox from '../TopicBox.vue'; // Hier importiere TopicBox
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from "vue";

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
    const topics = store.state.topics;
    const showSettings = ref(false);
    // Laden Sie die Daten beim Komponentenstart

    const userId = route.params.currentUserId;
    const router = useRouter();


    // Verwende computed, um currentUser reaktiv zu machen

    const currentUser = computed(() => store.state.users[userId - 1]);


    const showreply = false;

    // Erhalte Zugriff auf den Vuex-Store

    const toggleSettings = () => {
      console.log("geklickt laan")
      showSettings.value = !showSettings.value;
    };

    const procreatedComments = computed(() => currentUser.value.procreated);
    const contracreatedComments = computed(() => currentUser.value.contracreated);


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

    function navigateData(ids, data) {
      let current = data;
      if (ids.topicIndex !== undefined) {
        current = current[ids.topicIndex];
      }
      if (ids.type && ids.commentIndex !== undefined) {
        current = ids.type === 'pro' ? current.proComments[ids.commentIndex] : current.contraComments[ids.commentIndex];
      }
      for (let i = 1; ids['replyIndex' + i] !== undefined; i++) {
        current = current.replies[ids['replyIndex' + i]];
      }
      return current;
    }

    function getLastElementFromPath() {
      // Leeren Sie die Arrays zu Beginn jeder Ausführung der Funktion
      topicsSuche = [];
      commentSuche = [];
      replySuche = [];
      nestedReplySuche = [];

      // Schleife durch die Pfade
      nestedRepliesPaths.value.forEach(path => {
        const ids = parseId(path);
        const nestedreply = navigateData(ids, topics); // topics sollte Ihre Hauptdatenquelle sein

        const depth = Object.keys(ids).length - 1;
        if (depth === 1) {
          topicsSuche.push(nestedreply);
        } else if (depth === 2) {
          commentSuche.push(nestedreply);
        } else if (depth >= 3) {
          replySuche.push(nestedreply);
        }
      });
    }


    getLastElementFromPath();




    const procreatedCommentsList = computed(() => {
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

    // Fügen Sie die beiden Listen zusammen
    const mergedCommentList = computed(() => {
      return procreatedCommentsList.value.concat(contracreatedCommentsList.value);
    });



    // Sortieren Sie die Liste nach comment.createdAt absteigend (neuestes zuerst)
    const sortedCommentList = mergedCommentList.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));



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
     const editMode = ref(false);
    const editableBio = ref('');

    const enableEditMode = () => {
      editableBio.value = currentUser.value.bio; // Kopiert die aktuelle Bio in ein bearbeitbares Feld
      editMode.value = true;
      
      
    };

    const disableEditMode = () => {
      editMode.value = false;
    };

    const saveBio = () => {

      currentUser.value.bio = editableBio.value;
      editMode.value = false;
            const editableBiOhneValue = editableBio.value;
      const payload = { editableBiOhneValue, userId }
      store.dispatch("updateBio", payload)
    };


    return {
      iconColor,
      currentUser,
      showDropdown,
      toggleDropdown,
      state,
      TopicUpVotes,
      TopicDownVotes,
      showreply,
      topicsSuche,
      replySuche,
      commentSuche,
      nestedReplySuche,
      bookmarkrouting,
      sortedCommentList,
      showSettings,
      toggleSettings,
            editMode,
      editableBio,
      enableEditMode,
      disableEditMode,
      saveBio,

    };
  },



}


</script>

<style scoped>
.edit-icon {
  cursor: pointer;
}

.edit-mode {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: left;
    gap: 10px;
}

.bio-edit {
  width: 100%;
  /* Passen Sie die Breite nach Bedarf an */
}

.edit-actions {
  display: flex;
  justify-content: space-around;
  padding: 5px;
}

.cancel-icon, .save-icon {
  cursor: pointer;
}
button.back-button {

    left: 10px;
    position: fixed;
    border: none;
    background-color: transparent;
    padding: 10px 0px 0px 20px;
    z-index: 999;
    /* top: 10px; */
}


button.button-4 {
    min-width: 55%;
}
.buttons-setting {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    gap: 10px;
}
.button-4 {
  appearance: none;
  background-color: #FAFBFC;
  border: 1px solid rgba(27, 31, 35, 0.15);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0, rgba(255, 255, 255, 0.25) 0 1px 0 inset;
  box-sizing: border-box;
  color: #24292E;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 6px 16px;
  position: relative;
  transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
}

.button-4:hover {
  background-color: #F3F4F6;
  text-decoration: none;
  transition-duration: 0.1s;
}

.button-4:disabled {
  background-color: #FAFBFC;
  border-color: rgba(27, 31, 35, 0.15);
  color: #959DA5;
  cursor: default;
}

.button-4:active {
  background-color: #EDEFF2;
  box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
  transition: none 0s;
}

.button-4:focus {
  outline: 1px transparent;
}

.button-4:before {
  display: none;
}

.button-4:-webkit-details-marker {
  display: none;
}

.settings-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 100%;
  width: 100%;

}

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




.setting-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  width: 100%;
  font-size: 25px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.setting-button h3 {
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
  cursor: pointer;
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
  cursor: pointer;
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
  z-index: 999;
  /* Hier können Sie den gewünschten z-index-Wert einstellen */
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