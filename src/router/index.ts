import { createRouter, createWebHistory } from 'vue-router'
import { staticRouter } from './modules/staticRouter'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...staticRouter],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export default router
