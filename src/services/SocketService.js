import io from "socket.io-client";
import store from "../store/store";

const SocketService = {
  socket: null,

  init(userId) {
    // Nehmen Sie die userId als Parameter
    this.socket = io("https://c964nzv2-3000.euw.devtunnels.ms");

    this.socket.on("connect", () => {
      this.socket.emit("register", userId); // Senden Sie die userId an den Server, sobald Sie verbunden sind
    });
  },
/*   updateFrontend(message) {
    store.commit("ADD_MESSAGE", message);
  }, */

  onMessage(callback) {
    console.log("kuree");
    this.socket.on("message", (message) => {
      console.log("kuree", message);
      try {
        if (message.senderId == store.state.currentUser) {
          console.log("an sich serlber")
        } else {
        callback(message);
        }

  
      } catch (error) {
        console.error("Fehler beim fetchen des chats: ", error);
      }
    });
  },

  sendMessage(message) {
    console.log("wird gesendet");
    try {
      this.socket.emit("send-message", message);
      if (store.state.currentUser.id == message.zielId) {
        console.log("zurück ta qi rob")
      }
      else {
              store.commit("ADD_MESSAGE", message); 
      }

    } catch (error) {
      console.error(error);
    }
  },

  disconnect(userId) {
    console.log(userId);
    this.socket.disconnect(userId);

    // Entfernen Sie den 'beforeunload'-Event-Listener
  },
};

export default SocketService;
