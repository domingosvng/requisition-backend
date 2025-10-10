import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './components/Dashboard.vue';
import NovoPedido from './components/NovoPedido.vue';

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/novo-pedido', component: NovoPedido },
  // Add inventory and suppliers management routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
