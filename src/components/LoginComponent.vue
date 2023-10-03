<template>
  <div class="login">
    <div class="background-box"></div>
    <div class="login-card">
      <h2 class="login-title">Login</h2>
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4>Login</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="loginUser">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                name="username"
                v-model="username"
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                placeholder="Password"
                name="password"
                id="password"
                v-model="password"
              >
            </div>
            <error-messages :errors="errorMessages" v-if="errorMessages.length" />
            <button type="submit" class="btn btn-primary">Login</button>
            <router-link to="/register" class="card-link">Need an account?</router-link>
            <router-link to="/password-reset" class="card-link">Forgot Password?</router-link>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ErrorMessages from "@/components/ErrorMessages.vue"; // Adjust the import path as needed
export default {
  components: {
    ErrorMessages,
  },
  data() {
    return {
      username: "",
      password: "",
      errorMessages: [],
    };
  },
  methods: {
    ...mapActions(["login"]),
    async loginUser() {
      console.log("loginUser method called");
      let user = {
        name: this.username,
        password: this.password,
      };
      try {
        const response = await this.login(user);
        console.log("Response from login:", response);

        if (response.success) {
          // Request was successful, and login is successful
          const userId = response.userId;
          console.log("Redirecting to profile page with user ID:", userId);

          // Redirect the user to their profile page with the user ID
          this.$router.push(`/profil/${userId}`);
        } else {
          // Handle unsuccessful login based on the response
          console.log("Login unsuccessful.");
          this.errorMessages = ["Invalid username or password. Please try again."];
        }
      } catch (error) {
        console.error("Error logging in:", error);
        this.errorMessages = ["An error occurred while logging in. Please try again."];
      }
    },
  },
};
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
}

.background-box {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  opacity: 0.5;
  z-index: -1;
}

.login-card {
  width: 400px;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.card {
  border-radius: 0;
}

.btn {
  border-radius: 25px; /* Rounded button */
  margin-top: 20px; /* Increased spacing between form and button */
  background-color: #007bff; /* Button background color */
  color: #fff; /* Button text color */
  border: none; /* Remove button border */
  padding: 10px 20px; /* Adjust button padding */
  cursor: pointer; /* Add pointer cursor on hover */
  transition: background-color 0.3s; /* Smooth hover transition */
}

.btn:hover {
  background-color: #0056b3; /* Button color on hover */
}

.form-control {
  border-radius: 25px;
  margin-bottom: 15px;
  padding: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  margin-bottom: 5px; /* Slightly increased space between label and input */
}

.card-link {
  text-decoration: none;
  color: #007bff;
  margin-left: 10px;
}

.card-link:hover {
  text-decoration: underline;
}

.card-link:last-child {
  margin-top: 10px; /* Add some space between "Need an account?" and "Forgot Password?" links */
}
</style>