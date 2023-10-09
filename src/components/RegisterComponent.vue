<template>
  <div>
    <div class="row">
      <div class="card mx-auto">
        <div class="card-header text-white bg-primary">
          <h4>Register</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="registerUser">
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
              <label for="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Name"
                name="name"
                v-model="name"
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="text"
                placeholder="Email"
                name="email"
                v-model="email"
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
            <div class="form-group">
              <label for="confirm_password">Confirm Password</label>
              <input
                type="password"
                class="form-control"
                placeholder="Confirm Password"
                name="confirm_password"
                id="confirm_password"
                v-model="confirm_password"
              >
            </div>
            <error-messages :errors="errorMessages" v-if="errorMessages.length" />
            <button class="btn btn-primary">Register</button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <router-link to="/login" class="card-link">Already have an account?</router-link>
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
  components:{
    ErrorMessages,
  },
  data() {
    return {
      username: "",
      password: "",
      confirm_password: "",
      name: "",
      email: "",
      errorMessages:[],
    };
  },
  methods: {
  ...mapActions(["register"]),
    async registerUser() {
    let user = {
      username: this.username,
      password: this.password,
      confirm_password: this.confirm_password,
      email: this.email,
      name: this.name
    };
    try {
  const res = await this.register(user);
  if (res.data && res.data.success) {
    console.log(res); // Log the response
    this.$router.push("/feed");
  } else if (res.data && res.data.message) {
    // Display the error message from the server
    this.errorMessages = [res.data.message];
  } else {
    this.errorMessages = ["An error occurred while registering. Please try again."];
  }
} catch (error) {
  console.error("Error registering user:", error);
  this.errorMessages = ["An error occurred while registering. Please try again."];
}

  }
}
};
</script>

<style scoped>
.registration {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5; /* Soft white background */
}

.registration-title {
  text-align: center;
  color: #333; /* Dark gray text color */
  font-size: 24px;
  margin-bottom: 20px;
}

.registration-card {
  width: 60%;
}

.card {
  border: none; /* Remove card border */
  border-radius: 10px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Soft shadow */
}

.btn {
  border-radius: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-label {
  width: 100%; /* Labels start at the same spot */
  font-weight: bold;
  color: #555; /* Medium gray label text color */
}

.form-control {
  border: 1px solid #ccc; /* Light gray border */
  border-radius: 5px; /* Rounded corners */
  padding: 10px;
}

.form-control:focus {
  border-color: #007bff; /* Blue border when focused */
}

.registration-form {
  padding: 20px;
}
</style>