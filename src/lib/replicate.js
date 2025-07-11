
class ReplicateClient {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.replicate.com/v1';
  }

  async analyzeSoil(soilData) {
    try {
      const prompt = `Analyze this soil data for farming: 
        pH: ${soilData.pH || 'unknown'}, 
        Moisture: ${soilData.moisture || 'unknown'}, 
        Nutrients: ${soilData.nutrients || 'unknown'}, 
        Area: ${soilData.area} ${soilData.unit}. 
        Provide recommendations for crop selection and soil improvement.`;

      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "mistralai/mixtral-8x7b-instruct-v0.1:cf18decbf51c27fed6bbdc3492312c1c903222a56e3fe9ca02d6cbe5198afc10",
          input: {
            prompt: prompt,
            max_new_tokens: 512,
            temperature: 0.7,
          }
        })
      });

      const prediction = await response.json();
      return await this.getPredictionResult(prediction.id);
    } catch (error) {
      console.error('Soil analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze soil data'
      };
    }
  }

  async predictYield(farmData) {
    try {
      const prompt = `Based on this farm data, predict the potential crop yield:
        Area: ${farmData.area} ${farmData.unit}
        Crop: ${farmData.crop || 'general crops'}
        Soil Type: ${farmData.soilType || 'mixed'}
        Climate: ${farmData.climate || 'moderate'}
        Provide yield estimates and farming recommendations.`;

      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "mistralai/mixtral-8x7b-instruct-v0.1:cf18decbf51c27fed6bbdc3492312c1c903222a56e3fe9ca02d6cbe5198afc10",
          input: {
            prompt: prompt,
            max_new_tokens: 512,
            temperature: 0.7,
          }
        })
      });

      const prediction = await response.json();
      return await this.getPredictionResult(prediction.id);
    } catch (error) {
      console.error('Yield prediction error:', error);
      return {
        success: false,
        error: 'Failed to predict yield'
      };
    }
  }

  async getPredictionResult(predictionId) {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
          }
        });

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
          return {
            success: true,
            data: prediction.output.join(''),
            prediction: prediction
          };
        } else if (prediction.status === 'failed') {
          return {
            success: false,
            error: 'Prediction failed'
          };
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Error getting prediction result:', error);
        return {
          success: false,
          error: 'Failed to get prediction result'
        };
      }
    }

    return {
      success: false,
      error: 'Prediction timed out'
    };
  }
}

// Initialize with API key
const replicateClient = new ReplicateClient('r8_LPhlvc1UXv0yruj3q4djPYAjKSSD2NY3JFMZd');

export default replicateClient;
