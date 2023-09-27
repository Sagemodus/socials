<template>
  <div>
    <h2>Login</h2>
    <div class="row">
      <div class="card mx-auto">
        <div class="card-header text-white bg-primary">
          <h4>Login</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="loginUser">
            <div class="form-group">
              <label for="username">Username</label>
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
              <label for="password">Password</label>
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
            <input type="submit" class="btn btn-primary" value="Login">
            &nbsp;&nbsp;&nbsp;&nbsp;
            <router-link to="/register" class="card-link">Need an account?</router-link>
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
}

.login-title {
  text-align: center;
}

.login-card {
  width: 60%;
}

.card {
  border-radius: 0;
}

.btn {
  border-radius: 0;
}

.form-control {
  border-radius: 0;
}

.registration-form {
  padding: 20px;
}
</style>
