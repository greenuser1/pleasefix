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
        
        // Force a longer delay to ensure the session is properly set
        console.log('Waiting for session to be established...');
        
        // Check session before redirecting
        const checkSession = () => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', `${window.location.hostname === "localhost" 
            ? "http://localhost:3001/api" 
            : "https://pleasefix.onrender.com/api"}/session-test`);
          xhr.withCredentials = true;
          
          xhr.onload = () => {
            try {
              const sessionResponse = JSON.parse(xhr.responseText);
              console.log('Session check before redirect:', sessionResponse);
              
              if (sessionResponse.user) {
                console.log('Session established, redirecting to plants page...');
                this.$router.push('/plants');
              } else {
                console.log('Session not established yet, trying again in 500ms...');
                setTimeout(checkSession, 500);
              }
            } catch (e) {
              console.error('Failed to parse session check response:', e);
              setTimeout(() => {
                console.log('Redirecting to plants page anyway...');
                this.$router.push('/plants');
              }, 1000);
            }
          };
          
          xhr.onerror = () => {
            console.error('Session check failed with network error');
            setTimeout(() => {
              console.log('Redirecting to plants page anyway...');
              this.$router.push('/plants');
            }, 1000);
          };
          
          xhr.send();
        };
        
        setTimeout(checkSession, 1000);
      } catch (error) {
        console.error('Authentication error:', error);
        this.errorMessage = error.message || 'An error occurred';
        this.isSubmitting = false;
      }
    }
  }
};
</script>

