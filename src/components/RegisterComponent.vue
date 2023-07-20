<template>
    <div class="login-container">
      <div class="form-container">
        <h1>Login</h1>
        <form @submit="login">
          <div class="column">
            <div class="input-group">
              <label for="user">User:</label>
              <input type="text" id="user" v-model="user" required>
            </div>
            <div class="input-group">
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="email" required>
            </div>
            <div class="input-group">
              <label for="birthdate">Birthdate:</label>
              <input type="date" id="birthdate" v-model="birthdate" required>
            </div>
          </div>
          <div class="column">
            <div class="input-group">
              <label for="password">Password:</label>
              <input type="password" id="password" v-model="password" required>
            </div>
            <div class="input-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" v-model="confirmPassword" required>
            </div>
          </div>
          <div class="additional-links">
            <a href="/login">Already have an account?</a>
            <p><a href="#">Forgot your password?</a></p>
          </div>
          <button type="submit" @click="register">Login</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, addDoc } from "firebase/firestore";
  import db from '../firebase/init.js';
  import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { useRouter } from 'vue-router'
  
  const colRef = collection(db, 'users');
  
  export default {
    data() {
        return {
    email: "",
    password: "",
    uName: "", // Add this line
    TelNumber: "", // Add this line
    dob: "", // Add this line
    router: null
  };
    },
  
    mounted() {
      this.router = useRouter();
    },
  
    methods: {
      calculateAge(dob) {
        let currentDate = new Date();
        let birthDate = new Date(dob);
        let difference = currentDate - birthDate;
        let age = Math.floor(difference / 31557600000);
        return age;
      },
  
      register() {
        if (this.calculateAge(this.dob) < 18) {
          alert("We do not accept people under the age of 18");
          return;
        }
  
        createUserWithEmailAndPassword(getAuth(), this.email, this.password)
          .then(() => {
            const userAuth = getAuth().currentUser;
            console.log("Successfully registered!");
            var user = {
              uid: userAuth.uid,
              userName: this.uName,
              email: this.email,
              TelephoneNumber: this.TelNumber,
              DateOfBirth: this.dob,
              coins: 0,
              multiplier: 1,
              activeBet: {}
            };
            updateProfile(userAuth, {
              displayName: this.uName
            })
              .then(() => {
                console.log("User profile updated!");
              })
              .catch((error) => {
                console.log(error.code);
                alert(error.message);
              });
  
            addDoc(colRef, user)
              .then((docRef) => {
                console.log('Document was created with following ID:', docRef.id)
                this.router.push('/feed');
              })
              .catch((error) => {
                console.log(error.code);
                alert(error.message);
              });
          })
          .catch((error) => {
            console.log(error.code);
            alert(error.message);
          });
      }
    }
  }
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
  