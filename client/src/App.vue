<template>
  <div id="app">
    <div v-if="hasError" class="error-container">
      <h1>Something went wrong</h1>
      <p>{{ errorMessage }}</p>
      <button class="btn btn-primary" @click="resetError">Try Again</button>
    </div>
    <router-view v-else />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      hasError: false,
      errorMessage: ''
    }
  },
  errorCaptured(err, vm, info) {
    console.error('Error captured in App.vue:', err, info);
    this.errorMessage = err.message || 'An unexpected error occurred';
    this.hasError = true;
    return false; // prevent propagation
  },
  methods: {
    resetError() {
      this.hasError = false;
      this.errorMessage = '';
      window.location.reload();
    }
  }
}
</script>

<style>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
}
</style>

