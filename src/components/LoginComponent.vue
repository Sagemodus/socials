<template>
  <div class="login-container">
    <div class="form-container">
      <h1>Login</h1>
      <form @submit="login">
        <div class="input-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="additional-links">
          <p>Don't have an account? <a href="#">Register one</a></p>
          <p><a href="#">Forgot your password?</a></p>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async login(event) {
      event.preventDefault();

      try {
        const { user } = await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
        console.log('Login successful:', user);
        alert('Login successful');
        // Perform any additional actions or routing here after successful login
      } catch (error) {
        console.error('Login error:', error);
        alert('Invalid email or password');
      }

      // Reset the form fields
      this.email = '';
      this.password = '';
    }
  },
  mounted() {
    // Initialize Firebase
    const firebaseConfig = {
      // Add your Firebase project configuration here
    };

    // Initialize Firebase app
    firebase.initializeApp(firebaseConfig);
  }
};
</script>

<style>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #F9F9F9;
}

.form-container {
  background-color: #FFFFFF;
  border-bottom: 1px solid #CCCCCC;
  padding: 20px;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #CCCCCC;
  outline: none;
}

.additional-links {
  margin-top: 20px;
}

.additional-links p {
  margin-bottom: 10px;
}

.additional-links a {
  color: grey
}

button {
  padding: 10px 20px;
  background-color: #ECECEC;
  color: #000000;
  border-radius:10px;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #D1D1D1;
}
</style>