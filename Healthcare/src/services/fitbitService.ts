// fitbitService.ts
import axios from 'axios';

const FITBIT_CLIENT_ID = import.meta.env.VITE_FITBIT_CLIENT_ID;
const FITBIT_REDIRECT_URI = import.meta.env.VITE_FITBIT_REDIRECT_URI;
// Use proxy server instead of direct API calls
const FITBIT_API_BASE = 'https://healthcarefinal-1.onrender.com/api/fitbit';

// Scopes needed for health data
// Note: HRV, SpO2, and breathing rate may require Fitbit Premium subscription
// and special OAuth application permissions from Fitbit
const SCOPES = [
  'activity',
  'heartrate',
  'sleep',
  'nutrition',
  'profile',
  'oxygen_saturation',  // For SpO2 data
  'respiratory_rate',   // For breathing rate
  'temperature',        // For temperature variation
].join('%20');

export class FitbitService {
  // Generate authorization URL
  static getAuthUrl(): string {
    return `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(FITBIT_REDIRECT_URI)}&scope=${SCOPES}&expires_in=604800&prompt=consent`;
  }

  // Parse access token from URL hash
  static parseAccessToken(hash: string): string | null {
    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
  }

  // Format date for Fitbit API (converts 'today' to YYYY-MM-DD)
  private static formatDate(date: string): string {
    if (date === 'today') {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    return date;
  }

  // Get heart rate data for today
  static async getHeartRateData(accessToken: string, date: string = 'today') {
    try {
      const formattedDate = this.formatDate(date);
      console.log('Fetching heart rate data...');

      // Try intraday data first (requires special permission)
      try {
        const intradayResponse = await axios.get(
          `${FITBIT_API_BASE}/1/user/-/activities/heart/date/${formattedDate}/1d/1min.json`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );
        console.log('Intraday heart rate data received');
        return intradayResponse.data;
      } catch (intradayError: any) {
        // If intraday fails, fall back to daily summary
        console.log('Intraday data not available, using daily summary');
        const dailyResponse = await axios.get(
          `${FITBIT_API_BASE}/1/user/-/activities/heart/date/${formattedDate}/1d.json`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );
        console.log('Daily heart rate data received');
        return dailyResponse.data;
      }
    } catch (error: any) {
      console.error('Error fetching heart rate data:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get activity summary for today
  static async getActivitySummary(accessToken: string, date: string = 'today') {
    try {
      const formattedDate = this.formatDate(date);
      const response = await axios.get(
        `${FITBIT_API_BASE}/1/user/-/activities/date/${formattedDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  }

  // Get sleep data
  static async getSleepData(accessToken: string, date: string = 'today') {
    try {
      const formattedDate = this.formatDate(date);
      const response = await axios.get(
        `${FITBIT_API_BASE}/1.2/user/-/sleep/date/${formattedDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      throw error;
    }
  }

  // Get sleep log for a date range (for weekly data)
  static async getSleepRange(accessToken: string, startDate: string, endDate: string) {
    try {
      const response = await axios.get(
        `${FITBIT_API_BASE}/1.2/user/-/sleep/date/${startDate}/${endDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sleep range:', error);
      throw error;
    }
  }

  // Get heart rate variability (HRV)
  static async getHRVData(accessToken: string, date: string = 'today') {
    try {
      const formattedDate = this.formatDate(date);
      const response = await axios.get(
        `${FITBIT_API_BASE}/1/user/-/hrv/date/${formattedDate}.json`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      // Handle 403 Forbidden specifically - usually means Premium subscription required
      if (error.response?.status === 403) {
        console.warn('HRV data access forbidden. This may require:');
        console.warn('1. Fitbit Premium subscription');
        console.warn('2. Re-authorization with updated scopes');
        console.warn('3. Special OAuth application permissions from Fitbit');

        // Return null instead of throwing to allow app to continue
        return null;
      }

      console.error('Error fetching HRV data:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get calories burned
  static async getCaloriesData(accessToken: string, date: string = 'today') {
    try {
      const formattedDate = this.formatDate(date);
      const response = await axios.get(
        `${FITBIT_API_BASE}/1/user/-/activities/calories/date/${formattedDate}/1d.json`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching calories data:', error);
      throw error;
    }
  }

  // Format heart rate data for chart
  static formatHeartRateForChart(data: any) {
    // Check if we have intraday data
    if (data['activities-heart-intraday']?.dataset) {
      const dataset = data['activities-heart-intraday'].dataset;
      // Sample every hour to reduce data points
      const hourlyData = dataset.filter((_: any, index: number) => index % 60 === 0);

      return hourlyData.map((item: any) => ({
        time: item.time.substring(0, 5), // HH:MM format
        value: item.value,
      }));
    }

    // Fall back to creating estimated data from resting heart rate
    if (data['activities-heart']?.[0]) {
      const restingHR = data['activities-heart'][0].value.restingHeartRate;
      if (restingHR) {
        // Create sample data points throughout the day
        return [
          { time: "00:00", value: restingHR - 8 },
          { time: "04:00", value: restingHR - 10 },
          { time: "08:00", value: restingHR + 5 },
          { time: "12:00", value: restingHR + 12 },
          { time: "16:00", value: restingHR + 8 },
          { time: "20:00", value: restingHR },
          { time: "24:00", value: restingHR - 5 },
        ];
      }
    }

    return [];
  }

  // Format sleep data for chart
  static formatSleepDataForChart(sleepData: any) {
    if (!sleepData.sleep || sleepData.sleep.length === 0) return null;

    const sleep = sleepData.sleep[0]; // Get main sleep session
    const levels = sleep.levels.summary;

    return {
      deep: levels.deep?.minutes / 60 || 0,
      light: levels.light?.minutes / 60 || 0,
      rem: levels.rem?.minutes / 60 || 0,
      wake: levels.wake?.minutes / 60 || 0,
    };
  }

  // Calculate sleep score
  static calculateSleepScore(sleepData: any): number {
    if (!sleepData.sleep || sleepData.sleep.length === 0) return 0;

    const sleep = sleepData.sleep[0];
    const efficiency = sleep.efficiency || 0;
    const duration = sleep.duration / 3600000; // Convert to hours

    // Simple scoring: efficiency * 0.7 + (duration >= 7 ? 30 : duration * 4.3)
    const durationScore = duration >= 7 ? 30 : duration * 4.3;
    return Math.round(efficiency * 0.7 + durationScore);
  }
}