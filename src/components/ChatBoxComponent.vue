<template>
  <div>
    <h1>Chat Application</h1>
    <div>
      <div v-for="message in messages" :key="message.id">
        {{ message.text }}
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message">
  </div>
</template>

<script>
export default {
  data() {
    return {
      newMessage: '',
      messages: [],
    };
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === '') return;

      // Emit the message to the server
      this.$socket.emit('chatMessage', this.newMessage);

      // Add the message to the local list
      this.messages.push({
        id: new Date().getTime(),
        text: this.newMessage,
      });

      // Clear the input field
      this.newMessage = '';
    },
  },
};
</script>
