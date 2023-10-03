<template>
  <div class="reset-password">
    <h2>Reset Password</h2>
    <form @submit.prevent="resetPassword">
      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input
          type="password"
          id="newPassword"
          v-model="newPassword"
          class="form-control"
        >
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          class="form-control"
        >
      </div>
      <button type="submit" class="btn btn-primary">Reset Password</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newPassword: "",
      confirmPassword: "",
      resetToken: "", // You should obtain the reset token from the route or URL parameters
    };
  },
  methods: {
    async resetPassword() {
      if (this.newPassword === this.confirmPassword) {
        // Passwords match, proceed with the password reset

        try {
          // Make an API request to reset the password using the reset token
          const response = await fetch("/api/users/reset-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              resetToken: this.resetToken,
              newPassword: this.newPassword,
            }),
          });

          if (response.ok) {
            // Password reset was successful
            alert("Password reset successful. You can now log in with your new password.");
            // Redirect the user to the login page or another appropriate page
            this.$router.push("/login"); // Replace with your login route
          } else {
            // Password reset failed, display an error message
            alert("Password reset failed. Please try again later.");
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          alert("An error occurred while resetting your password. Please try again later.");
        }
      } else {
        // Passwords do not match, display an error message
        alert("Passwords do not match. Please try again.");
      }
    },
  },
  created() {
    // You should obtain the reset token from the route or URL parameters when the component is created
    this.resetToken = this.$route.query.token; // Replace with the actual way you obtain the token
  },
};
</script>

<style scoped>
.password-reset {
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

.password-reset-card {
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
  border-radius: 25px;
  margin-top: 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #0056b3;
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
  margin-bottom: 5px;
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
  margin-top: 10px;
}
</style>