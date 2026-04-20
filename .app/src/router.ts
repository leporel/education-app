import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
  { path: '/srs', name: 'srs', component: () => import('./views/SrsView.vue') },
  {
    path: '/d/:domain',
    name: 'domain',
    component: () => import('./views/DomainView.vue'),
    props: true,
  },
  {
    path: '/d/:domain/m/:module',
    name: 'module',
    component: () => import('./views/ModuleView.vue'),
    props: true,
  },
  {
    path: '/d/:domain/m/:module/doc/:docId',
    name: 'lesson',
    component: () => import('./views/LessonView.vue'),
    props: true,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
