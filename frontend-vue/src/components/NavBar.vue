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
        <span class="avatar" :aria-label="`Conta de ${username}`" :title="username" @click="toggleMenu" tabindex="0" role="button">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" />
          <template v-else>
            <div class="avatar-initials" aria-hidden="true">{{ initials }}</div>
          </template>
        </span>
        <div v-if="menuOpen" class="profile-menu" role="menu" @click.stop>
          <button class="menu-item" role="menuitem" @click="onLogout">Sair</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Accept logout prop but don't destructure it in a way that shadows changes
const props = defineProps({ logout: Function });
const router = useRouter();
const route = useRoute();

// Reactive sources that reflect localStorage so NavBar updates same-tab
const username = ref(localStorage.getItem('username') || 'Usuário');
const userRole = ref(localStorage.getItem('userRole') || null);
const avatarUrl = ref(localStorage.getItem('avatarUrl') || null);

// Derived helpers
const isAdmin = computed(() => userRole.value === 'ADMIN_TEC' || userRole.value === 'ADMIN');
const roleDisplay = computed(() => {
  const roles = {
    SOLICITANTE: 'Solicitante',
    ADMIN_TEC: 'Tec. Admin',
    GESTOR_DADM: 'Gestor DADM',
  };
  return roles[userRole.value] || userRole.value;
});

const loading = ref(false);
const menuOpen = ref(false);
function toggleMenu() { menuOpen.value = !menuOpen.value; }

const initials = computed(() => {
  const name = (username.value || '').trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
});

async function onLogout() {
  try {
    loading.value = true;
    // call the provided logout prop (may be sync or async)
    if (props.logout && typeof props.logout === 'function') {
      const maybePromise = props.logout();
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
    } else {
      // fallback: clear local storage tokens if no logout handler provided
      try {
        localStorage.removeItem('userToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        localStorage.removeItem('avatarUrl');
      } catch (e) {
        /* ignore */
      }
    }
    // after logout, navigate to login route
    try { await router.push({ path: '/login' }); } catch (e) { /* ignore if router not ready */ }
  } finally {
    loading.value = false;
  }
}

// React to auth changes triggered by other tabs or same-tab events
function handleStorageEvent(e) {
  // Only react to relevant keys for minimal churn
  if (!e) return;
  if (e.key === 'username' || e.key === 'userRole' || e.key === 'avatarUrl') {
    username.value = localStorage.getItem('username') || 'Usuário';
    userRole.value = localStorage.getItem('userRole');
    avatarUrl.value = localStorage.getItem('avatarUrl');
  }
}

function handleAuthChanged() {
  username.value = localStorage.getItem('username') || 'Usuário';
  userRole.value = localStorage.getItem('userRole');
  avatarUrl.value = localStorage.getItem('avatarUrl');
}

// Close menu when clicking outside, pressing Escape, or navigating
function onDocumentClick(e) {
  // close menu if clicking outside the profile area
  const avatarEl = document.querySelector('.avatar');
  const menuEl = document.querySelector('.profile-menu');
  if (!avatarEl) return;
  if (menuOpen.value && menuEl && !avatarEl.contains(e.target) && !menuEl.contains(e.target)) {
    menuOpen.value = false;
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageEvent);
  window.addEventListener('auth-changed', handleAuthChanged);
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageEvent);
  window.removeEventListener('auth-changed', handleAuthChanged);
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});

// Also close the menu when the route changes (e.g. user navigates)
watch(() => route.fullPath, () => { menuOpen.value = false; });
</script>

<style scoped>
.app-navbar {
  --brand-admin-green: #28a745; /* solid admin */
  --brand-manager-light: #90ee90; /* light manager */
  --avatar-bg: #c8e6c9;
  --avatar-fg: #2e7d32;
  --menu-border: #e1bee7;
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
.avatar-initials { width:32px; height:32px; border-radius:50%; background:var(--avatar-bg); display:flex; align-items:center; justify-content:center; color:var(--avatar-fg); font-weight:700; }
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
  border: 1px solid var(--menu-border);
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

/* Improved focus ring for keyboard users */
.logout-btn:focus, .avatar:focus, .menu-item:focus {
  outline: 3px solid rgba(62, 126, 47, 0.25);
  outline-offset: 2px;
}
</style>
