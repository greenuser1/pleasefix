import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./assets/style.css"

// Get the correct API URL
const getApiUrl = () => {
  return window.location.hostname === "localhost" ? "http://localhost:3001" : "https://pleasefix.onrender.com" // Make sure this matches your actual backend URL
}

// Add global error handler
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error:", message, "at", source, lineno, colno, error)
  return false
}

// Add unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  if (event.reason && event.reason.status === 401) {
    router.push("/")
  }
})

// Simplified router guard to ensure the app loads
router.beforeEach((to, from, next) => {
  console.log(`Navigating from ${from.path} to ${to.path}`)

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const xhr = new XMLHttpRequest()
    const apiUrl = `${getApiUrl()}/api/auth/me`

    console.log(`Checking auth at: ${apiUrl}`)

    xhr.open("GET", apiUrl)
    xhr.withCredentials = true

    xhr.onload = () => {
      console.log(`Auth check response: ${xhr.status}`)
      if (xhr.status >= 200 && xhr.status < 300) {
        next()
      } else {
        next("/")
      }
    }

    xhr.onerror = () => {
      console.error("Auth check network error")
      next("/")
    }

    xhr.send()
  } else {
    next()
  }
})

// Create and mount the app with error handling
try {
  console.log("Creating Vue app...")
  const app = createApp(App)

  app.config.errorHandler = (err, vm, info) => {
    console.error("Vue error handler:", err, info)
  }

  app.config.globalProperties.$debug = (message, data) => {
    console.log(`[DEBUG] ${message}`, data)
  }

  // Add a global property for the API URL
  app.config.globalProperties.$apiUrl = getApiUrl()

  console.log("Adding router...")
  app.use(router)

  console.log("Mounting app...")
  app.mount("#app")

  console.log("App successfully mounted")
} catch (error) {
  console.error("Error during app initialization:", error)
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Something went wrong</h1>
      <p>Please try refreshing the page. If the problem persists, contact support.</p>
      <p>Error: ${error.message}</p>
      <button onclick="window.location.reload()">Refresh Page</button>
    </div>
  `
}

