import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import Dashboard from '../components/Dashboard.vue';
import NovoPedido from '../components/NovoPedido.vue';
import Inventario from '../components/Inventario.vue';
import Fornecedores from '../components/Fornecedores.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/novo-pedido', name: 'NovoPedido', component: NovoPedido, meta: { requiresAuth: true, requiredRole: 'SOLICITANTE' } },
  { path: '/gestao-inventario', name: 'Inventario', component: Inventario, meta: { requiresAuth: true } },
  { path: '/gestao-fornecedores', name: 'Fornecedores', component: Fornecedores, meta: { requiresAuth: true } },
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
