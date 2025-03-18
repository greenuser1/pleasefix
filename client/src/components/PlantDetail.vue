<template>
<div class="plant-detail">
  <header class="header container">
    <div class="logo">
      <span>GreenTrack</span>
    </div>
    <div class="nav">
      <button class="btn btn-text" @click="goBack">
        &larr; Back to Plants
      </button>
      <button class="btn btn-text" @click="logout">
        Logout
      </button>
    </div>
  </header>
  
  <main class="container">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading plant details...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-primary" @click="goBack">
        Back to Plants
      </button>
    </div>
    
    <div v-else class="plant-details-container">
      <div class="plant-header">
        <h1>{{ plant.name }}</h1>
        <div v-if="plant.species" class="badge badge-primary">
          {{ plant.species }}
        </div>
        <p>Added on {{ formatDate(plant.createdAt) }}</p>
      </div>
      
      <div class="plant-actions">
        <button class="btn btn-primary" @click="showAddCareLogModal = true">
          Add Care Log
        </button>
        <button class="btn btn-outline" @click="showEditPlantModal = true">
          Edit Plant
        </button>
        <button class="btn btn-outline text-danger" @click="confirmDeletePlant">
          Delete Plant
        </button>
      </div>
      
      <div class="implementation-section">
        <h2>Implementation Plan</h2>
        <div class="implementation-tabs">
          <div 
            class="implementation-tab" 
            :class="{ active: activeTab === 'watering' }"
            @click="activeTab = 'watering'"
          >
            Watering
          </div>
          <div 
            class="implementation-tab" 
            :class="{ active: activeTab === 'fertilizing' }"
            @click="activeTab = 'fertilizing'"
          >
            Fertilizing
          </div>
          <div 
            class="implementation-tab" 
            :class="{ active: activeTab === 'pruning' }"
            @click="activeTab = 'pruning'"
          >
            Pruning
          </div>
        </div>
        
        <div class="implementation-content">
          <div v-if="activeTab === 'watering'" class="implementation-details">
            <h3>Watering Schedule</h3>
            <p>Use the <a @click.prevent="goToCalculator" href="#" class="text-link">Watering Calculator</a> to determine the optimal watering schedule for this plant.</p>
            
            <div class="implementation-tips">
              <h4>Watering Tips</h4>
              <ul>
                <li>Water in the morning to reduce evaporation</li>
                <li>Check soil moisture before watering</li>
                <li>Adjust watering based on season and environment</li>
                <li>Use room temperature water</li>
              </ul>
            </div>
            
            <div class="implementation-history">
              <h4>Watering History</h4>
              <div v-if="getFilteredLogs('watering').length === 0" class="empty-history">
                No watering logs yet
              </div>
              <div v-else class="history-list">
                <div v-for="log in getFilteredLogs('watering')" :key="log._id" class="history-item">
                  <span class="history-date">{{ formatDate(log.createdAt) }}</span>
                  <span v-if="log.notes" class="history-notes">{{ log.notes }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'fertilizing'" class="implementation-details">
            <h3>Fertilizing Schedule</h3>
            <p>Most plants benefit from fertilizing during the growing season (spring and summer).</p>
            
            <div class="implementation-tips">
              <h4>Fertilizing Tips</h4>
              <ul>
                <li>Use a balanced fertilizer appropriate for your plant type</li>
                <li>Fertilize less frequently than recommended on the package</li>
                <li>Avoid fertilizing during dormant periods</li>
                <li>Water thoroughly before applying fertilizer</li>
              </ul>
            </div>
            
            <div class="implementation-history">
              <h4>Fertilizing History</h4>
              <div v-if="getFilteredLogs('fertilizing').length === 0" class="empty-history">
                No fertilizing logs yet
              </div>
              <div v-else class="history-list">
                <div v-for="log in getFilteredLogs('fertilizing')" :key="log._id" class="history-item">
                  <span class="history-date">{{ formatDate(log.createdAt) }}</span>
                  <span v-if="log.notes" class="history-notes">{{ log.notes }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'pruning'" class="implementation-details">
            <h3>Pruning Schedule</h3>
            <p>Regular pruning helps maintain plant health and encourages new growth.</p>
            
            <div class="implementation-tips">
              <h4>Pruning Tips</h4>
              <ul>
                <li>Use clean, sharp tools to prevent disease</li>
                <li>Remove dead or yellowing leaves regularly</li>
                <li>Prune after flowering for flowering plants</li>
                <li>Avoid pruning more than 1/3 of the plant at once</li>
              </ul>
            </div>
            
            <div class="implementation-history">
              <h4>Pruning History</h4>
              <div v-if="getFilteredLogs('pruning').length === 0" class="empty-history">
                No pruning logs yet
              </div>
              <div v-else class="history-list">
                <div v-for="log in getFilteredLogs('pruning')" :key="log._id" class="history-item">
                  <span class="history-date">{{ formatDate(log.createdAt) }}</span>
                  <span v-if="log.notes" class="history-notes">{{ log.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="care-logs-section">
        <h2>Care History</h2>
        
        <div v-if="careLogsLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading care logs...</p>
        </div>
        
        <div v-else-if="careLogs.length === 0" class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>No care logs yet</h3>
          <p class="empty-state-text">Start tracking care for this plant</p>
          <button class="btn btn-primary" @click="showAddCareLogModal = true">
            Add First Care Log
          </button>
        </div>
        
        <div v-else class="care-logs-list">
          <div v-for="log in careLogs" :key="log._id" class="care-log-card">
            <div class="care-log-header">
              <span class="care-type">{{ formatCareType(log.type) }}</span>
              <span class="care-date">{{ formatDate(log.createdAt) }}</span>
            </div>
            <div v-if="log.notes" class="care-log-notes">
              {{ log.notes }}
            </div>
            <div class="care-log-actions">
              <button class="btn btn-text text-danger" @click="deleteCareLog(log._id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <!-- Add Care Log Modal -->
  <div v-if="showAddCareLogModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Add Care Log for {{ plant.name }}</h3>
        <button class="btn btn-text" @click="showAddCareLogModal = false">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="addCareLog">
          <div class="form-group">
            <label for="careType" class="form-label">Care Type</label>
            <select
              id="careType"
              v-model="newCareLog.type"
              class="form-input"
              required
            >
              <option value="watering">Watering</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="pruning">Pruning</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="careNotes" class="form-label">Notes (Optional)</label>
            <textarea
              id="careNotes"
              v-model="newCareLog.notes"
              class="form-input"
              placeholder="Enter any notes"
              rows="3"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showAddCareLogModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="addingCareLog">
              {{ addingCareLog ? 'Adding...' : 'Add Care Log' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Edit Plant Modal -->
  <div v-if="showEditPlantModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Plant</h3>
        <button class="btn btn-text" @click="showEditPlantModal = false">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="updatePlant">
          <div class="form-group">
            <label for="editPlantName" class="form-label">Plant Name</label>
            <input
              id="editPlantName"
              v-model="editingPlant.name"
              type="text"
              class="form-input"
              placeholder="Enter plant name"
              required
            />
          </div>
          <div class="form-group">
            <label for="editPlantSpecies" class="form-label">Species (Optional)</label>
            <input
              id="editPlantSpecies"
              v-model="editingPlant.species"
              type="text"
              class="form-input"
              placeholder="Enter plant species"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="showEditPlantModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import api from '@/services/api.js';

export default {
name: 'PlantDetail',
props: {
  id: {
    type: String,
    required: true
  }
},
data() {
  return {
    plant: {},
    careLogs: [],
    loading: true,
    careLogsLoading: false,
    addingCareLog: false,
    error: null,
    showAddCareLogModal: false,
    showEditPlantModal: false,
    activeTab: 'watering',
    newCareLog: {
      type: 'watering',
      notes: '',
      plant: ''
    },
    editingPlant: {
      name: '',
      species: ''
    }
  };
},
created() {
  console.log(`PlantDetail component created with ID: ${this.id}`);
  this.fetchPlantData();
  window.addEventListener('beforeunload', this.handleBeforeUnload);
},
beforeUnmount() {
  window.removeEventListener('beforeunload', this.handleBeforeUnload);
},
methods: {
  handleBeforeUnload(event) {
    if (this.showAddCareLogModal && (this.newCareLog.notes || this.newCareLog.type !== 'watering')) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  },
  async fetchPlantData() {
    try {
      this.loading = true;
      this.error = null;
      
      console.log(`Fetching plant data for ID: ${this.id}`);
      const plantData = await api.get(`/plants/${this.id}`);
      console.log('Plant data received:', plantData);
      this.plant = plantData;
      this.newCareLog.plant = this.id;
      
      // Initialize editing plant data
      this.editingPlant = {
        name: this.plant.name,
        species: this.plant.species || ''
      };
      
      await this.fetchCareLogs();
      this.loading = false;
    } catch (error) {
      console.error('Error fetching plant data:', error);
      this.error = `Failed to load plant: ${error.message}`;
      this.loading = false;
      
      // If unauthorized, redirect to login
      if (error.status === 401) {
        this.$router.push('/');
      }
    }
  },
  async fetchCareLogs() {
    try {
      this.careLogsLoading = true;
      
      console.log(`Fetching care logs for plant ID: ${this.id}`);
      const careLogs = await api.getPlantCareLogs(this.id);
      console.log(`Received ${careLogs ? careLogs.length : 0} care logs`);
      
      this.careLogs = careLogs || [];
      this.careLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      this.careLogsLoading = false;
    } catch (error) {
      console.error('Error fetching care logs:', error);
      this.careLogsLoading = false;
      
      // If unauthorized, redirect to login
      if (error.status === 401) {
        this.$router.push('/');
      }
    }
  },
  async addCareLog() {
    try {
      this.addingCareLog = true;
      
      console.log(`Adding care log for plant ID: ${this.id}`);
      const response = await api.createCareLog(this.newCareLog);
      console.log('Care log added:', response);
      
      this.careLogs.unshift(response);
      
      this.newCareLog.notes = '';
      this.newCareLog.type = 'watering';
      this.showAddCareLogModal = false;
      this.addingCareLog = false;
    } catch (error) {
      console.error('Error adding care log:', error);
      alert(`Failed to add care log: ${error.message}`);
      this.addingCareLog = false;
    }
  },
  async updatePlant() {
    try {
      console.log(`Updating plant ID: ${this.id}`);
      const response = await api.put(`/plants/${this.id}`, this.editingPlant);
      console.log('Plant updated:', response);
      
      // Update local plant data
      this.plant.name = this.editingPlant.name;
      this.plant.species = this.editingPlant.species;
      
      this.showEditPlantModal = false;
    } catch (error) {
      console.error('Error updating plant:', error);
      alert(`Failed to update plant: ${error.message}`);
    }
  },
  async deleteCareLog(logId) {
    if (confirm('Are you sure you want to delete this care log?')) {
      try {
        console.log(`Deleting care log ID: ${logId}`);
        await api.deleteCareLog(logId);
        console.log('Care log deleted');
        
        // Remove from local array
        this.careLogs = this.careLogs.filter(log => log._id !== logId);
      } catch (error) {
        console.error('Error deleting care log:', error);
        alert(`Failed to delete care log: ${error.message}`);
      }
    }
  },
  confirmDeletePlant() {
    if (confirm(`Are you sure you want to delete ${this.plant.name}? This action cannot be undone.`)) {
      this.deletePlant();
    }
  },
  async deletePl  This action cannot be undone.`)) {
      this.deletePlant();
    }
  },
  async deletePlant() {
    try {
      console.log(`Deleting plant ID: ${this.id}`);
      await api.delete(`/plants/${this.id}`);
      console.log('Plant deleted');
      
      // Navigate back to plants list
      this.$router.push('/plants');
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert(`Failed to delete plant: ${error.message}`);
    }
  },
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  formatCareType(type) {
    const types = {
      watering: 'Watering',
      fertilizing: 'Fertilizing',
      pruning: 'Pruning',
      other: 'Other'
    };
    return types[type] || type;
  },
  getFilteredLogs(type) {
    return this.careLogs.filter(log => log.type === type);
  },
  goBack() {
    this.$router.push('/plants');
  },
  goToCalculator() {
    this.$router.push('/calculator');
  },
  async logout() {
    try {
      console.log('Logging out...');
      await api.logout();
      console.log('Logout successful, redirecting to login page');
      this.$router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if logout fails, redirect to login page
      this.$router.push('/');
    }
  }
}
};
</script>

<style scoped>
.plant-detail {
  min-height: 100vh;
  background-color: var(--background-alt);
}

.plant-details-container {
  padding: 1.5rem 0;
}

.plant-header {
  margin-bottom: 1.5rem;
}

.plant-header h1 {
  margin-bottom: 0.5rem;
}

.plant-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.implementation-section {
  background-color: var(--background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.implementation-section h2 {
  margin-bottom: 1rem;
}

.implementation-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
}

.implementation-tab {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.implementation-tab.active {
  border-bottom-color: var(--primary);
  color: var(--primary);
  font-weight: 500;
}

.implementation-details h3 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.implementation-tips {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: var(--primary-light);
  border-radius: var(--radius);
}

.implementation-tips h4 {
  margin-bottom: 0.5rem;
}

.implementation-tips ul {
  padding-left: 1.5rem;
}

.implementation-tips li {
  margin-bottom: 0.5rem;
}

.implementation-history {
  margin-top: 1.5rem;
}

.implementation-history h4 {
  margin-bottom: 0.5rem;
}

.empty-history {
  color: var(--text-light);
  font-style: italic;
  padding: 0.5rem 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

.history-date {
  font-weight: 500;
}

.history-notes {
  color: var(--text-light);
  font-size: 0.875rem;
}

.care-logs-section {
  margin-top: 2rem;
}

.care-logs-section h2 {
  margin-bottom: 1rem;
}

.care-logs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.care-log-card {
  background-color: var(--background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem;
}

.care-log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.care-type {
  font-weight: 500;
  text-transform: capitalize;
}

.care-date {
  color: var(--text-light);
  font-size: 0.875rem;
}

.care-log-notes {
  font-size: 0.875rem;
  white-space: pre-line;
  margin-bottom: 0.5rem;
}

.care-log-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
}

.error-message {
  color: var(--error);
  margin-bottom: 1.5rem;
}

.text-link {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

.text-link:hover {
  color: var(--primary-dark);
}
</style>

