<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <span>GreenTrack</span>
        </div>
        <p class="auth-subtitle">Keep your plants happy and healthy</p>
      </div>
      
      <div v-if="apiError" class="api-error">
        <h3>Cannot connect to server</h3>
        <p>{{ apiError }}</p>
        <button class="btn btn-primary" @click="retryConnection">Retry Connection</button>
      </div>
      
      <template v-else>
        <div class="tabs">
          <div 
            class="tab" 
            :class="{ active: isLogin }" 
            @click="isLogin = true"
          >
            Login
          </div>
          <div 
            class="tab" 
            :class="{ active: !isLogin }" 
            @click="isLogin = false"
          >
            Register
          </div>
        </div>
        
        <form @submit.prevent="submitForm" class="auth-form">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div v-if="!isLogin" class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" class="btn btn-primary auth-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Please wait...' : (isLogin ? 'Login' : 'Register') }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AuthForm',
  data() {
    return {
      isLogin: true,
      form: {
        username: '',
        email: '',
        password: ''
      },
      errorMessage: '',
      isSubmitting: false,
      apiError: null
    };
  },
  mounted() {
    console.log('AuthForm component mounted');
    this.checkApiConnection();
  },
  methods: {
    checkApiConnection() {
      const xhr = new XMLHttpRequest();
      const apiUrl = window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://pleasefix.onrender.com";
        
      console.log(`Checking API connection at: ${apiUrl}`);
      
      xhr.open('GET', apiUrl);
      xhr.timeout = 5000; // 5 second timeout
      
      xhr.onload = () => {
        console.log(`API connection test status: ${xhr.status}`);
        if (xhr.status >= 200 && xhr.status < 300) {
          this.apiError = null;
        } else {
          this.apiError = `Server returned error: ${xhr.status}`;
        }
      };
      
      xhr.onerror = () => {
        console.error('API connection test failed with network error');
        this.apiError = "Cannot connect to server. Please check your connection.";
      };
      
      xhr.ontimeout = () => {
        console.error('API connection test timed out');
        this.apiError = "Server is not responding. Please try again later.";
      };
      
      xhr.send();
    },
    
    retryConnection() {
      this.apiError = null;
      this.checkApiConnection();
    },
    
    async submitForm() {
      try {
        this.isSubmitting = true;
        this.errorMessage = '';
        const endpoint = this.isLogin ? '/auth/login' : '/auth/register';
        const data = this.isLogin 
          ? { email: this.form.email, password: this.form.password }
          : this.form;
          
        console.log(`Submitting ${this.isLogin ? 'login' : 'register'} form to ${endpoint}`);
        const response = await api.request('POST', endpoint, data);
        console.log('Authentication response:', response);
        
        // Force a delay to ensure the session is properly set
        console.log('Waiting for session to be established...');
        setTimeout(() => {
          console.log('Redirecting to plants page...');
          this.$router.push('/plants');
        }, 500);
      } catch (error) {
        console.error('Authentication error:', error);
        this.errorMessage = error.message || 'An error occurred';
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--background-alt);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.auth-header {
  padding: 2rem;
  text-align: center;
}

.auth-subtitle {
  margin-top: 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.auth-form {
  padding: 1.5rem;
}

.auth-submit {
  width: 100%;
  margin-top: 1rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  border-bottom: 2px solid var(--primary);
  color: var(--primary);
  font-weight: 500;
}

.api-error {
  padding: 2rem;
  text-align: center;
  color: var(--error);
}

.api-error h3 {
  margin-bottom: 1rem;
}

.api-error button {
  margin-top: 1rem;
}
</style>

