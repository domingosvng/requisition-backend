import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import Dashboard from '../components/Dashboard.vue';
import NovoPedido from '../components/NovoPedido.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/novo-pedido', name: 'NovoPedido', component: NovoPedido, meta: { requiresAuth: true, requiredRole: 'SOLICITANTE' } },
  // Future routes for Admin actions, Inventory, and Suppliers will go here
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userToken');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
