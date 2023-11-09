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

    // Überwachen Sie den Online-Status eines Benutzers
    this.socket.on("user-online", (userId) => {
      store.commit("setUserOnline", userId);
    });

    // Überwachen Sie den Offline-Status eines Benutzers
    this.socket.on("user-offline", (userId) => {
      store.commit("setUserOffline", userId);
    });
    // eslint-disable-next-line no-unused-vars
    this.socket.on("update-frontend", (message) => {});
  },

  onMessage(callback) {
    this.socket.on("message", (message) => {
      console.log("kuree")
      try {

        callback(message);
      } catch (error) {
        console.error("Fehler beim fetchen des chats: ", error);
      }
    });
  },

  sendMessage(message) {
    
      try {
        this.socket.emit("send-message", message);
        

      } catch (error) {
       console.error(error)
      }
 
  },

  disconnect() {
    this.socket.disconnect();
  },
};

export default SocketService;
