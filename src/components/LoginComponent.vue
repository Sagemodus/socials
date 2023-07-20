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
import { signInWithEmailAndPassword,getAuth } from 'firebase/auth'
import 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    login() {
      try{
      // login user
      if(this.email=="" || this.password=="")
        {
        alert("Please fill out the fields");
        return
        }
      signInWithEmailAndPassword(getAuth(),this.email,this.password)
      .then(() => {
        console.log("Successfully signed in!");
        this.router.push('/feed')
        this.$emit('loggedIn')
      })
      .catch((error) => {
    console.log(error.code);
    switch(error.code) {
        case "auth/invalid-email":
            this.errMsg.value = "The Email that was provided either doesnt exist or is wrong"
            break;
        case "auth/user-not-found":
            this.errMsg.value = "No account with that email was found";
            break;
        case "auth/wrong-password":
            this.errMsg.value = "The password you provided is not correct"
            break;
        default:
            this.errMsg.value = "Email or password was incorrect";
            break;
    }
})
      }catch(error){
        console.error(error);
      }
    },
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