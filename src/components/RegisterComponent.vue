<template>
  <div class="login-container">
    <div class="form-container">
      <h1>Register</h1>
      <form @submit.prevent="register">
        <div class="input-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="input-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="input-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</template>
  
<script>
import axios from 'axios'; // Import Axios for making API requests

export default {
  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    };
  },
  methods: {
    register() {
      // Check if passwords match
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      // Send registration data to your Express.js server
      axios.post('/api/register', {
        username: this.username,
        email: this.email,
        password: this.password
      })
      .then((response) => {
        // Handle the response from the server (e.g., redirect to login page)
        console.log(response.data);
        // Redirect to login page or display a success message
      })
      .catch((error) => {
        console.error(error);
        // Handle registration error (e.g., display error message)
      });
    }
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
  input[type="password"],
  input[type="email"],
  input[type="date"] {
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
    color: grey;
  }
  
  button {
    padding: 10px 20px;
    background-color: #ECECEC;
    color: #000000;
    border-radius: 10px;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #D1D1D1;
  }
  </style>
  