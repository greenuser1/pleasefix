import { createRouter, createWebHistory } from "vue-router"
import AuthForm from "@/components/AuthForm.vue"
import PlantManager from "@/components/PlantManager.vue"
import PlantDetail from "@/components/PlantDetail.vue"
import WateringCalculator from "@/components/WateringCalculator.vue"

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

// Simplified router guard
router.beforeEach((to, from, next) => {
  console.log(`Route navigation: ${from.path} -> ${to.path}`)

  // For now, allow all navigation to make debugging easier
  next()
})

export default router

