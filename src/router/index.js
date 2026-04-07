import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../pages/Login.vue'
import NotesList from '../pages/NotesList.vue'
import NoteForm from '../pages/NoteForm.vue'
import NoteDetail from '../pages/NoteDetail.vue'
import '../index.css'

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: NotesList, meta: { requiresAuth: true } },
  { path: '/notes/new', component: NoteForm, meta: { requiresAuth: true } },
  { path: '/notes/:noteCode', component: NoteDetail, meta: { requiresAuth: true } },
  { path: '/notes/:noteCode/edit', component: NoteForm, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.canAccessProtectedRoutes) {
    return next('/login')
  }

  if (to.path === '/login' && auth.canAccessProtectedRoutes) {
    return next('/')
  }

  next()
})

export default router
