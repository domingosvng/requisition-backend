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
      <div class="profile"> 
        <span class="avatar" :aria-label="`Perfil de ${username}`" :title="username" @click="toggleMenu" tabindex="0" role="button">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" />
          <template v-else>
            <div class="avatar-initials" aria-hidden="true">{{ initials }}</div>
          </template>
        </span>
        <span class="user-greeting">Olá, {{ username }} ({{ roleDisplay }})</span>
        <div v-if="menuOpen" class="profile-menu" role="menu" @click.stop>
          <button class="menu-item" role="menuitem" @click="() => {}">Perfil</button>
          <button class="menu-item" role="menuitem" @click="onLogout">Sair</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
const { logout } = defineProps({ logout: Function });
const username = localStorage.getItem('username') || 'Usuário';
const userRole = localStorage.getItem('userRole');
const avatarUrl = localStorage.getItem('avatarUrl') || null; // optional image URL
const initials = computed(() => {
  const name = (username || '').trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
});
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
const router = useRouter();

const loading = ref(false);
const menuOpen = ref(false);
function toggleMenu() { menuOpen.value = !menuOpen.value; }
async function onLogout() {
  try {
    loading.value = true;
    // call the provided logout prop (may be sync or async)
    if (typeof logout === 'function') {
      const maybePromise = logout();
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
    } else {
      // fallback: clear local storage tokens if no logout handler provided
      try { localStorage.removeItem('userToken'); localStorage.removeItem('username'); localStorage.removeItem('userRole'); } catch (e) { /* ignore */ }
    }
    // after logout, navigate to login route
    try { router.push({ path: '/login' }); } catch(e) { /* ignore if router not ready */ }
  } finally {
    loading.value = false;
  }
}
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
.profile { display:flex; align-items:center; gap:8px; }
.avatar { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.06); }
.avatar-img { width:32px; height:32px; border-radius:50%; object-fit:cover; }
.avatar-initials { width:32px; height:32px; border-radius:50%; background:#c8e6c9; display:flex; align-items:center; justify-content:center; color:#2e7d32; font-weight:700; }
.user-icon { display:block; }
.loading-content { display:flex; align-items:center; gap:8px; }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.logout-btn:focus, .avatar:focus { outline: 3px solid rgba(62, 126, 47, 0.25); outline-offset: 2px; }

/* Profile dropdown menu styles */
.profile-menu {
  position: absolute;
  right: 20px;
  top: 60px;
  background: #fff;
  border: 1px solid #e1bee7;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  border-radius: 6px;
  padding: 6px 8px;
  z-index: 1200;
  min-width: 140px;
}
.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 8px 10px;
  color: #3A004D;
  cursor: pointer;
}
.menu-item:hover {
  background: #f3e6fb;
}
.avatar { position: relative; cursor: pointer; }
</style>
