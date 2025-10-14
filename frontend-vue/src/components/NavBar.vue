<template>
  <nav class="app-navbar">
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
const props = defineProps({ logout: Function });
const username = localStorage.getItem('username') || 'Usuário';
const userRole = localStorage.getItem('userRole');
const isAdmin = computed(() => userRole === 'ADMIN_TEC' || userRole === 'GESTOR_DADM' || userRole === 'ADMIN');
const roleDisplay = computed(() => {
  const roles = {
    'SOLICITANTE': 'Solicitante',
    'ADMIN_TEC': 'Tec. Admin',
    'GESTOR_DADM': 'Gestor DADM',
    'ADMIN': 'Administrador'
  };
  return roles[userRole] || userRole;
});
</script>

<style scoped>
.app-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  background-color: #3A004D;
  color: white;
  height: 60px;
  min-height: 60px;
  max-height: 60px;
  box-sizing: border-box;
}
.logo-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.logo {
  height: 40px;
  width: auto;
  margin-right: 12px;
}
.system-title {
  font-weight: bold;
  font-size: 1.2em;
  white-space: nowrap;
}
.nav-links {
  display: flex;
  gap: 18px;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
}
.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  padding: 5px 10px;
}
.nav-link:hover {
  color: #CC0000;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.user-greeting {
  white-space: nowrap;
}
.logout-btn {
  background: #CC0000;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.logout-btn:hover {
  background: #a30000;
}
</style>
