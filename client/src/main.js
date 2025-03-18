import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./assets/style.css"

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const xhr = new XMLHttpRequest()
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3001/api/auth/me"
        : "https://pleasefix.onrender.com/api/auth/me" // Only your new backend URL

    xhr.withCredentials = true

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        next()
      } else {
        next("/")
      }
    }

    xhr.onerror = () => {
      next("/")
    }

    xhr.send()
  } else {
    next()
  }
})

window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && event.reason.status === 401) {
    router.push("/")
  }
})

const app = createApp(App)

app.config.globalProperties.$debug = (message, data) => {
  console.log(`[DEBUG] ${message}`, data)
}

app.use(router)
app.mount("#app")

