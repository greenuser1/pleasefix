<script>
import api from '@/services/api';

export default {
  name: 'WateringCalculator',
  data() {
    return {
      calculatorData: {
        plantType: '',
        potSize: '',
        season: '',
        sunlight: ''
      },
      showResults: false,
      waterAmount: '',
      waterUnit: '',
      frequencyText: '',
      wateringTips: []
    };
  },
  methods: {
    calculateWaterNeeds() {
      // Convert pot size to number
      const potSize = parseInt(this.calculatorData.potSize);
      
      // Base calculations
      let waterAmount = 0;
      let frequencyDays = 0;
      
      
      switch(this.calculatorData.plantType) {
        case 'succulent':
          waterAmount = potSize * 0.25; 
          frequencyDays = 14; 
          break;
        case 'tropical':
          waterAmount = potSize * 0.75; 
          frequencyDays = 7; 
          break;
        case 'herb':
          waterAmount = potSize * 0.5; 
          frequencyDays = 5; 
          break;
        case 'vegetable':
          waterAmount = potSize * 0.8; 
          frequencyDays = 4; 
          break;
        case 'flower':
          waterAmount = potSize * 0.6; 
          frequencyDays = 6; 
          break;
        case 'fern':
          waterAmount = potSize * 0.7; 
          frequencyDays = 5; 
          break;
        case 'vine':
          waterAmount = potSize * 0.65; 
          break;
      }
      
      
      switch(this.calculatorData.season) {
        case 'summer':
          waterAmount *= 1.25; 
          frequencyDays = Math.max(2, Math.floor(frequencyDays * 0.7)); 
          break;
        case 'winter':
          waterAmount *= 0.75; 
          frequencyDays = Math.floor(frequencyDays * 1.5);
          break;
        case 'fall':
          waterAmount *= 0.9; 
          frequencyDays = Math.floor(frequencyDays * 1.2); 
          break;
     
      }
      
     
      switch(this.calculatorData.sunlight) {
        case 'high':
          waterAmount *= 1.2; 
          frequencyDays = Math.max(2, Math.floor(frequencyDays * 0.8)); 
          break;
        case 'low':
          waterAmount *= 0.8; 
          frequencyDays = Math.floor(frequencyDays * 1.2); 
          break;
      }
      
      waterAmount = Math.round(waterAmount * 10) / 10;
      
      if (waterAmount >= 16) {
        this.waterAmount = Math.round((waterAmount / 8) * 10) / 10;
        this.waterUnit = 'cups';
      } else {
        this.waterAmount = waterAmount;
        this.waterUnit = 'ounces';
      }
      
      this.frequencyText = `Every ${frequencyDays} days`;
      
      this.generateWateringTips();
      
      this.showResults = true;
    },
    
    generateWateringTips() {
      const commonTips = [
        'Water in the morning to reduce evaporation and fungal growth.',
        'Check soil moisture before watering - the top inch should be dry.'
      ];
      
      let specificTips = [];
      
      switch(this.calculatorData.plantType) {
        case 'succulent':
          specificTips = [
            'Allow soil to completely dry out between waterings.',
            'Reduce watering significantly during dormant periods.',
            'Use well-draining soil to prevent root rot.'
          ];
          break;
        case 'tropical':
          specificTips = [
            'Keep soil consistently moist but not soggy.',
            'Increase humidity by misting leaves or using a humidifier.',
            'Use room temperature water to avoid shocking the roots.'
          ];
          break;
        case 'herb':
          specificTips = [
            'Water when the top inch of soil feels dry.',
            'Avoid wetting the leaves to prevent disease.',
            'Most herbs prefer to dry slightly between waterings.'
          ];
          break;
        case 'vegetable':
          specificTips = [
            'Consistent watering is key for vegetable growth and fruit production.',
            'Water at the base of plants to keep foliage dry.',
            'Mulch around plants to retain moisture.'
          ];
          break;
        case 'flower':
          specificTips = [
            'Water deeply but infrequently to encourage strong root growth.',
            'Deadhead spent blooms to encourage more flowering.',
            'Reduce watering after flowering period.'
          ];
          break;
        case 'fern':
          specificTips = [
            'Keep soil consistently moist but not waterlogged.',
            'Increase humidity by misting regularly.',
            'Avoid letting ferns dry out completely.'
          ];
          break;
        case 'vine':
          specificTips = [
            'Water thoroughly when the top inch of soil is dry.',
            'Provide support for climbing varieties.',
            'Adjust watering based on growth rate - more during active growth.'
          ];
          break;
      }
      
      let seasonTip = '';
      switch(this.calculatorData.season) {
        case 'summer':
          seasonTip = 'During hot summer days, you may need to water more frequently than recommended.';
          break;
        case 'winter':
          seasonTip = 'In winter, allow soil to dry more between waterings as plant growth slows down.';
          break;
        case 'fall':
          seasonTip = 'As temperatures cool in fall, gradually reduce watering frequency.';
          break;
        case 'spring':
          seasonTip = 'Spring is the growing season for many plants - monitor closely for changing water needs.';
          break;
      }
      
      this.wateringTips = [...commonTips, ...specificTips, seasonTip];
    },
    
    goToPlants() {
      this.$router.push('/plants');
    },
    
    async logout() {
      try {
        console.log('Logging out...');
        await api.post('/auth/logout');
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

