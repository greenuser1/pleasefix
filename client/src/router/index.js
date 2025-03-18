import { createRouter, createWebHistory } from "vue-router"
import AuthForm from "@/components/AuthForm.vue"
import PlantManager from "@/components/PlantManager.vue"
import PlantDetail from "@/components/PlantDetail.vue"
import WateringCalculator from "@/components/WateringCalculator.vue"

// Get the correct API URL
const getApiUrl = () => {
  return window.location.hostname === "localhost" ? "http://localhost:3001" : "https://pleasefix.onrender.com" // Make sure this matches your actual backend URL
}

const checkAuth = () => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    const apiUrl = `${getApiUrl()}/api/auth/me`

    console.log(`Checking auth at: ${apiUrl}`)

    xhr.open("GET", apiUrl)
    xhr.withCredentials = true

    xhr.onload = () => {
      console.log(`Auth check response status: ${xhr.status}`)
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true)
      } else {
        resolve(false)
      }
    }

    xhr.onerror = () => {
      console.error("Network error during auth check")
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
  console.log(`Route navigation: ${from.path} -> ${to.path}`)

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.log("Route requires authentication, checking...")
    const isAuthenticated = await checkAuth()
    console.log(`Authentication check result: ${isAuthenticated ? "Authenticated" : "Not authenticated"}`)

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      next("/")
    } else {
      console.log("Authenticated, proceeding to route")
      next()
    }
  } else {
    next()
  }
})

export default router

