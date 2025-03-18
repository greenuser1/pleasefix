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
  methods: {
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
        
        // Check if we're authenticated immediately after login/register
        try {
          console.log('Verifying authentication...');
          await api.request('GET', '/auth/me');
          console.log('Authentication verified, redirecting to plants page');
          this.$router.push('/plants');
        } catch (verifyError) {
          console.error('Authentication verification failed:', verifyError);
          
          // Try one more time with a delay
          setTimeout(async () => {
            try {
              await api.request('GET', '/auth/me');
              this.$router.push('/plants');
            } catch (retryError) {
              this.errorMessage = 'Authentication failed. Please try again.';
              this.isSubmitting = false;
            }
          }, 1000);
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

