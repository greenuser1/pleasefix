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
    isSubmitting: false
  };
},
mounted() {
  // Component mounted
},
methods: {
  async submitForm() {
    try {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      if (this.isLogin) {
        await api.login({ 
          email: this.form.email, 
          password: this.form.password 
        });
      } else {
        await api.register(this.form);
      }
      
      // Try to get current user
      try {
        await api.getCurrentUser();
        
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
</style>

