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

// Enable auth checks
router.beforeEach(async (to, from, next) => {
  console.log(`Route navigation: ${from.path} -> ${to.path}`)

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      // Use our API service instead of direct XMLHttpRequest
      await api.getCurrentUser()
      next()
    } catch (error) {
      console.error("Auth check failed:", error)
      next("/")
    }
  } else {
    next()
  }
})

export default router

