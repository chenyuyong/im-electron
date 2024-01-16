import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from '../view/index.vue'
import Login from '../view/login.vue'
import Test from '../view/test.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/test',
    component: Test,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
