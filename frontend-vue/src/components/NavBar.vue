<template>
  <nav class="navbar navbar-expand-lg fixed-top app-navbar" style="background-color: #ffffff; height: 60px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
    <div class="nav-left">
      <div class="logo-container">
        <img src="/camafris-logo.png" alt="Logo" class="logo" />
        <span class="system-title">SGR - Gestão de Requisições</span>
      </div>
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link v-if="userRole === 'SOLICITANTE' || userRole === 'ADMIN_TEC' || userRole === 'admin_dept_tech'" to="/novo-pedido" class="nav-link">Novo Pedido</router-link>
        <router-link v-if="isAdmin" to="/gestao-inventario" class="nav-link">Inventário</router-link>
        <router-link v-if="isAdmin" to="/gestao-fornecedores" class="nav-link">Fornecedores</router-link>
      </div>
    </div>
    <div class="user-info">
      <span class="user-greeting">
        Olá, {{ username }} ({{ roleDisplay }})
      </span>
      <button @click="logout" class="logout-btn">Sair</button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
const { logout } = defineProps({ logout: Function });
const username = localStorage.getItem('username') || 'Usuário';
const userRole = localStorage.getItem('userRole');
// Only true admins and technical admins should see inventory/fornecedores links
const isAdmin = computed(() => userRole === 'ADMIN_TEC' || userRole === 'ADMIN');
const roleDisplay = computed(() => {
  const roles = {
    'SOLICITANTE': 'Solicitante',
    'ADMIN_TEC': 'Tec. Admin',
    'GESTOR_DADM': 'Gestor DADM'
  };
  return roles[userRole] || userRole;
});
</script>

<style scoped>
  .app-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ffffff;
  color: #222;
}
.logo-container {
  display: flex;
  align-items: center;
}
.logo {
  height: 40px;
  margin-right: 12px;
}
.system-title {
  font-weight: bold;
  font-size: 1.1em;
  color: #222;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 18px;
}
.nav-links {
  display: flex;
  gap: 18px;
}
.nav-link {
  color: #222;
  text-decoration: none;
  font-weight: 500;
}
.nav-link:hover {
  color: #581845;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.logout-btn {
  background: #d32f2f;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.logout-btn:hover {
  background: #b71c1c;
}
</style>
