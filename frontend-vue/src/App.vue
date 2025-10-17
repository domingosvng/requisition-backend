<template>
  <div id="app">
    <NavBar v-if="isAuthenticated" :logout="handleLogout" class="navbar fixed-top" />
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
  created() {
    window.addEventListener('storage', this.checkAuth);
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

<style scoped>
body {
  margin: 0;
  background: #f7f7fa;
}
.main-content {
  min-height: calc(100vh - 70px);
  padding-top: 70px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
