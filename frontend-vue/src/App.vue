<template>
  <div id="app">
    <NavBar v-if="isAuthenticated" :logout="handleLogout" />
    <main class="content-area">
      <router-view />
    </main>
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
.content-area {
  padding: 32px;
}
</style>
