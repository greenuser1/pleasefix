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
      <button class="btn btn-text" @click="goToCalculator">
        Watering Calculator
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
        <button class="btn btn-outline" @click="goToEditPlant">
          Edit Plant
        </button>
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
    newCareLog: {
      type: 'watering',
      notes: '',
      plant: ''
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
  goBack() {
    this.$router.push('/plants');
  },
  goToEditPlant() {
    // This would typically navigate to an edit page or show an edit modal
    alert('Edit functionality would be implemented here');
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
</style>

