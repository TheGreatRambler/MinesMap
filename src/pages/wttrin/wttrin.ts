export interface WeatherResponse {
  current_condition: CurrentCondition[];
  weather: DailyWeather[];
}

export interface CurrentCondition {
  temp_C: string;
  temp_F: string;
  weatherCode: string;
  weatherDesc: WeatherDescription[];
}

export interface DailyWeather {
  avgtempC: string;
  avgtempF: string;
  date: string;
  hourly: HourlyForecast[];
}

export interface HourlyForecast {
  tempC: string;
  tempF: string;
  weatherCode: string;
  weatherDesc: WeatherDescription[];
}

export interface WeatherDescription {
  value: string;
}

export async function fetchWeatherData(): Promise<WeatherResponse> {
  console.log('Fetching weather data...');
  try {
    const response = await fetch('http://wttr.in/Golden?format=j1');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const weatherData: WeatherResponse = await response.json();
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}
