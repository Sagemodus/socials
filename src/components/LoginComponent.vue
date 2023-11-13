<template>
  <div>
    <div class="row">
      <div class="card mx-auto">
        <div class="card-header text-white bg-primary">
          <h4>Login</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="loginUser" class="center-form">
            <div class="form-group">
              <label for="email">E-Mail</label>
              <input
                id="email"
                type="text"
                placeholder="email"
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
            <input type="submit" class="btn btn-primary" value="Login">
            &nbsp;&nbsp;&nbsp;&nbsp;
            <router-link to="/register" class="card-link">Need and account?</router-link>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { iconColor } from '../components/farben';

export default {

  data() {
    return {
      name: "",
      password: ""
    };
  },
  methods: {
    loginUser() {
      this.$store
        .dispatch('login', {
          password: this.password,
          email: this.email
        })
        .then(() => {
             const userfarbe = this.$store.state.currentUser.farbe;
          const color = userfarbe ? iconColor(userfarbe) : 'gray';
          console.log(color)
          document.documentElement.style.setProperty('--iconColor', color);
            this.$router.push({ name: 'feed' })       
        })
    }
  }
};
</script>
<style scoped>
.center-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.registration {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.registration-title {
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

.registration-card {
  width: 60%;
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-label {
  width: 100%;
  font-weight: bold;
  color: #555;
}

.form-control {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  max-width: 300px; /* Add max-width property to limit the width */
}

.form-control:focus {
  border-color: #007bff;
}

.btn {
  border-radius: 0;
}

.registration-form {
  margin: 0 auto;
  max-width: 400px; /* Add a max width to limit the form's width */
}
</style>