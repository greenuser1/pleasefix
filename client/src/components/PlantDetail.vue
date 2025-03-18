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
    }
  }
};
</script>

