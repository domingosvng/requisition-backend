import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginPage.vue';
import Dashboard from '../components/Dashboard.vue';
import NovoPedido from '../components/NovoPedido.vue';
import Inventario from '../components/Inventario.vue';
import Fornecedores from '../components/Fornecedores.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/novo-pedido', name: 'NovoPedido', component: NovoPedido, meta: { requiresAuth: true, requiredRole: 'SOLICITANTE' } },
  { path: '/gestao-inventario', name: 'Inventario', component: Inventario, meta: { requiresAuth: true, requiredRoles: ['ADMIN_TEC', 'ADMIN'] } },
  { path: '/gestao-fornecedores', name: 'Fornecedores', component: Fornecedores, meta: { requiresAuth: true, requiredRoles: ['ADMIN_TEC', 'ADMIN'] } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userToken');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
