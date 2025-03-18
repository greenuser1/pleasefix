import { createRouter, createWebHistory } from "vue-router"
import AuthForm from "@/components/AuthForm.vue"
import PlantManager from "@/components/PlantManager.vue"
import PlantDetail from "@/components/PlantDetail.vue"
import WateringCalculator from "@/components/WateringCalculator.vue"

const checkAuth = () => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3001/api/auth/me"
        : "https://greentrack-esmw.onrender.com/api/auth/me"

    xhr.open("GET", apiUrl)
    xhr.withCredentials = true

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true)
      } else {
        resolve(false)
      }
    }

    xhr.onerror = () => {
      resolve(false)
    }

    xhr.send()
  })
}

const routes = [
  {
    path: "/",
    component: AuthForm,
    meta: { guest: true },
  },
  {
    path: "/plants",
    component: PlantManager,
    meta: { requiresAuth: true },
  },
  {
    path: "/plants/:id",
    component: PlantDetail,
    name: "plant-detail",
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/calculator",
    component: WateringCalculator,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      next("/")
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router