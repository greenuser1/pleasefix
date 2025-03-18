<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <span>GreenTrack</span>
        </div>
        <p class="auth-subtitle">Keep your plants happy and healthy</p>
      </div>
      
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

      <div v-if="debugInfo" class="debug-info">
        <h4>Debug Info</h4>
        <pre>{{ debugInfo }}</pre>
        <button @click="testSession" class="btn btn-text">Test Session</button>
        <button @click="checkAuth" class="btn btn-text">Check Auth</button>
      </div>
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
      debugInfo: null
    };
  },
  mounted() {
    console.log('AuthForm component mounted');
    this.testSession();
  },
  methods: {
    async testSession() {
      try {
        const response = await api.testSession();
        this.debugInfo = JSON.stringify(response, null, 2);
        console.log('Session test:', response);
      } catch (error) {
        console.error('Session test error:', error);
        this.debugInfo = JSON.stringify(error, null, 2);
      }
    },
    
    async checkAuth() {
      try {
        const response = await api.getCurrentUser();
        this.debugInfo = JSON.stringify(response, null, 2);
        console.log('Auth check:', response);
        
        // If we get here, we're authenticated
        this.$router.push('/plants');
      } catch (error) {
        console.error('Auth check error:', error);
        this.debugInfo = JSON.stringify(error, null, 2);
      }
    },
    
    async submitForm() {
      try {
        this.isSubmitting = true;
        this.errorMessage = '';
        
        let response;
        if (this.isLogin) {
          console.log('Logging in with:', { email: this.form.email });
          response = await api.login({ 
            email: this.form.email, 
            password: this.form.password 
          });
        } else {
          console.log('Registering with:', { username: this.form.username, email: this.form.email });
          response = await api.register(this.form);
        }
        
        console.log('Authentication response:', response);
        this.debugInfo = JSON.stringify(response, null, 2);
        
        // Test session after login/register
        await this.testSession();
        
        // Try to get current user
        try {
          const userResponse = await api.getCurrentUser();
          console.log('Current user:', userResponse);
          this.debugInfo = JSON.stringify(userResponse, null, 2);
          
          // If we get here, authentication worked
          this.$router.push('/plants');
        } catch (error) {
          console.error('Failed to get current user:', error);
          this.errorMessage = 'Authentication succeeded but session verification failed. Please try again.';
          this.isSubmitting = false;
        }
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

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
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

.error-message {
  color: var(--error);
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(229, 57, 53, 0.1);
  border-radius: var(--radius);
}

.debug-info {
  padding: 1rem;
  background-color: #f5f5f5;
  border-top: 1px solid var(--border);
  font-size: 0.75rem;
  overflow-x: auto;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>

