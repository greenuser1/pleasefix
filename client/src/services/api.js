const API_BASE_URL =
  window.location.hostname === "localhost" ? "http://localhost:3001/api" : "https://pleasefix.onrender.com/api"

console.log(`API base URL: ${API_BASE_URL}`)

// Helper function to get cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
  return null
}

// Helper function to set cookies
const setCookie = (name, value, days) => {
  let expires = ""
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = `; expires=${date.toUTCString()}`
  }
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=None; Secure`
}

// Get token from cookies or localStorage
const getToken = () => {
  return getCookie("greentrack.token") || localStorage.getItem("token")
}

// Store token in cookies and localStorage
const storeToken = (token) => {
  setCookie("greentrack.token", token, 1) // 1 day
  localStorage.setItem("token", token)
}

export default {
  request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const fullUrl = `${API_BASE_URL}${endpoint}`
      console.log(`Making ${method} request to: ${fullUrl}`)
      console.log(`Current cookies: ${document.cookie || "No cookies"}`)

      try {
        const xhr = new XMLHttpRequest()
        xhr.open(method, fullUrl)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.withCredentials = true // Critical for cookies

        // Add token to Authorization header if available
        const token = getToken()
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)
          console.log("Added token to Authorization header")
        }

        xhr.onload = () => {
          console.log(`Response status for ${endpoint}: ${xhr.status}`)
          console.log(`Response cookies: ${document.cookie || "No cookies"}`)
          console.log(`Response headers: ${xhr.getAllResponseHeaders()}`)

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              console.log(`Response from ${endpoint}:`, response)

              // Store token if present in response
              if (response.token) {
                storeToken(response.token)
                console.log("Stored new token from response")
              }

              resolve(response)
            } catch (e) {
              console.log(`Response from ${endpoint} (not JSON):`, xhr.responseText)
              resolve(xhr.responseText)
            }
          } else {
            let errorMessage = "An error occurred"
            try {
              const errorData = JSON.parse(xhr.responseText)
              errorMessage = errorData.message || errorData.error || errorMessage
            } catch (e) {
              console.error(`Failed to parse error response:`, xhr.responseText)
            }

            console.error(`API error (${xhr.status}) from ${endpoint}:`, errorMessage)
            reject({
              status: xhr.status,
              message: errorMessage,
            })
          }
        }

        xhr.onerror = (e) => {
          console.error(`Network error for ${endpoint}:`, e)
          reject({ status: 0, message: "Network Error - Please check your connection" })
        }

        if (data) {
          console.log(`Request data for ${endpoint}:`, data)
          xhr.send(JSON.stringify(data))
        } else {
          xhr.send()
        }
      } catch (error) {
        console.error(`Exception during request to ${endpoint}:`, error)
        reject({ status: 0, message: `Request failed: ${error.message}` })
      }
    })
  },

  // Helper methods for common HTTP requests
  get(endpoint) {
    const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return this.request("GET", formattedEndpoint)
  },

  post(endpoint, data) {
    const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return this.request("POST", formattedEndpoint, data)
  },

  put(endpoint, data) {
    const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return this.request("PUT", formattedEndpoint, data)
  },

  delete(endpoint) {
    const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return this.request("DELETE", formattedEndpoint)
  },

  // Session test
  testSession() {
    return this.get("/auth/session-test")
  },

  // Auth methods
  register(userData) {
    return this.post("/auth/register", userData)
  },

  login(credentials) {
    return this.post("/auth/login", credentials)
  },

  logout() {
    localStorage.removeItem("token")
    return this.post("/auth/logout")
  },

  getCurrentUser() {
    return this.get("/auth/me")
  },

  // Care Log specific methods
  getCareLogs() {
    return this.get("/care-logs")
  },

  getPlantCareLogs(plantId) {
    return this.get(`/plants/${plantId}/care-logs`)
  },

  createCareLog(careLogData) {
    return this.post("/care-logs", careLogData)
  },

  updateCareLog(careLogId, careLogData) {
    return this.put(`/care-logs/${careLogId}`, careLogData)
  },

  deleteCareLog(careLogId) {
    return this.delete(`/care-logs/${careLogId}`)
  },
}

