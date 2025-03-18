import { createRouter, createWebHistory } from "vue-router"
import AuthForm from "@/components/AuthForm.vue"
import PlantManager from "@/components/PlantManager.vue"
import PlantDetail from "@/components/PlantDetail.vue"
import WateringCalculator from "@/components/WateringCalculator.vue"
import api from "@/services/api"

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

// Improved router guard
router.beforeEach(async (to, from, next) => {
  console.log(`Route navigation: ${from.path} -> ${to.path}`)

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.log("Route requires authentication, checking...")

    try {
      const isAuthenticated = await api.checkAuth()
      console.log(`Authentication check result: ${isAuthenticated ? "Authenticated" : "Not authenticated"}`)

      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login")
        next("/")
      } else {
        console.log("Authenticated, proceeding to route")
        next()
      }
    } catch (error) {
      console.error("Error during auth check:", error)
      next("/")
    }
  } else {
    next()
  }
})

export default router

