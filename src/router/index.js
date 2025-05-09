import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Importa con el mismo casing que el nombre de archivo
import Login from '../pages/login.vue'
import NotesList from '../pages/NotesList.vue'
import NoteForm from '../pages/NoteForm.vue'
import NoteDetail from '../pages/NoteDetail.vue'
import '..//index.css';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: NotesList, meta: { requiresAuth: true } },
  { path: '/notes/new', component: NoteForm, meta: { requiresAuth: true } },
  { path: '/notes/:noteCode', component: NoteDetail, meta: { requiresAuth: true } },
  { path: '/notes/:noteCode/edit', component: NoteForm, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }
  if (to.path === '/login' && auth.isLoggedIn) {
    return next('/')
  }
  next()
})

export default router
