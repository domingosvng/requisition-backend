<template>
  <div id="app">
    <NavBar v-if="isAuthenticated" :logout="handleLogout" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  components: { NavBar },
  data() {
    return {
      isAuthenticated: !!localStorage.getItem('userToken'),
    };
  },
  watch: {
    '$route'() {
      // Check authentication status on every route change
      this.checkAuth();
    }
  },
  created() {
    window.addEventListener('storage', this.checkAuth);
    this.checkAuth(); // Initial check
  },
  unmounted() {
    window.removeEventListener('storage', this.checkAuth);
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = !!localStorage.getItem('userToken');
    },
    handleLogout() {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      this.isAuthenticated = false;
      this.$router.push('/');
    },
  },
};
</script>

<style>
/* App.vue Styles */
.main-content {
  padding-top: 70px !important;
}
body {
  margin: 0;
}
</style>
