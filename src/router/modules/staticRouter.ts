import type { RouteRecordRaw } from 'vue-router';
import { ROUTE } from '../constants';
// const Lauoyt = () => import('@/layouts/default.vue')

export const staticRouter: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE.HOME,
    component: () => import('@/views/home/index.vue'),
  },
  {
    path: `/${ROUTE.HELP}`,
    name: ROUTE.HELP,
    component: () => import('@/views/help/index.vue'),
  },
];

