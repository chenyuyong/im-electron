import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from '../view/index.vue'
import Login from '../view/login.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
