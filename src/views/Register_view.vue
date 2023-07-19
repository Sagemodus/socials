<template>
    <div class="home">
      <RegisterComponent/>
    </div>
  </template>
  
  <script>
  // @ is an alias to /src
  import RegisterComponent from '@/components/RegisterComponent.vue'
  
  export default {
    name: 'LogIn',
    components: {
      RegisterComponent
    }
  }
  </script>
  