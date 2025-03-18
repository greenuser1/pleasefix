const API_BASE_URL =
  window.location.hostname === "localhost" ? "http://localhost:3001/api" : "https://pleasefix.onrender.com/api"

console.log(`API base URL: ${API_BASE_URL}`)

// Add a function to test the session
const testSession = () => {
  const xhr = new XMLHttpRequest()
  xhr.open("GET", `${API_BASE_URL}/session-test`)
  xhr.withCredentials = true
  xhr.onload = () => {
    try {
      const response = JSON.parse(xhr.responseText)
      console.log("Session test:", response)
    } catch (e) {
      console.error("Failed to parse session test response:", e)
    }
  }
  xhr.onerror = () => {
    console.error("Session test failed with network error")
  }
  xhr.send()
}

// Test the session after a short delay
setTimeout(testSession, 1000)

export default {
  request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const fullUrl = `${API_BASE_URL}${endpoint}`
      console.log(`Making ${method} request to: ${fullUrl}`)

      try {
        const xhr = new XMLHttpRequest()
        xhr.open(method, fullUrl)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.withCredentials = true // Important for cookies

        xhr.onload = () => {
          console.log(`Response status for ${endpoint}: ${xhr.status}`)
          console.log(`Response cookies: ${document.cookie || "No cookies"}`)

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              console.log(`Response from ${endpoint}:`, response)

              // Test session after login/register
              if (endpoint === "/auth/login" || endpoint === "/auth/register") {
                setTimeout(testSession, 500)
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

  // Rest of your methods remain the same
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

