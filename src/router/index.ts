import { createRouter, createWebHashHistory } from 'vue-router'
import WorkbenchView from '../views/WorkbenchView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'workbench', component: WorkbenchView },
    { path: '/docs', name: 'docs', component: () => import('../views/DocsIndexView.vue') },
    {
      path: '/docs/:lang',
      name: 'doc',
      component: () => import('../views/DocView.vue'),
      props: true,
    },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
