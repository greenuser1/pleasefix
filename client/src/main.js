import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./assets/style.css"

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

