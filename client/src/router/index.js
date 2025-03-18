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

// For now, disable auth checks to make debugging easier
router.beforeEach((to, from, next) => {
  console.log(`Route navigation: ${from.path} -> ${to.path}`)

  // Skip auth checks for now
  next()

  // Uncomment this when session is working
  /*
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    api.getCurrentUser()
      .then(() => {
        next();
      })
      .catch(() => {
        next("/");
      });
  } else {
    next();
  }
  */
})

export default router

