const API_BASE_URL =
  window.location.hostname === "localhost" ? "http://localhost:3001/api" : "https://pleasefix.onrender.com/api"

console.log(`API base URL: ${API_BASE_URL}`)

export default {
  request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const fullUrl = `${API_BASE_URL}${endpoint}`
      console.log(`Making ${method} request to: ${fullUrl}`)

      try {
        const xhr = new XMLHttpRequest()
        xhr.open(method, fullUrl)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.withCredentials = true

        xhr.onload = () => {
          console.log(`Response status for ${endpoint}: ${xhr.status}`)

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              console.log(`Response from ${endpoint}:`, response)
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

        xhr.ontimeout = () => {
          console.error(`Request timeout for ${endpoint}`)
          reject({ status: 0, message: "Request timed out - Server may be unavailable" })
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

