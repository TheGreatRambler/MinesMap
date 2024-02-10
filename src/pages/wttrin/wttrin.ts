interface WeatherResponse {
  current_condition: CurrentCondition[];
  weather: DailyWeather[];
}

interface CurrentCondition {
  temp_C: string;
  temp_F: string;
  weatherCode: string;
  weatherDesc: WeatherDescription[];
}

interface DailyWeather {
  avgtempC: string;
  avgtempF: string;
  date: string;
  hourly: HourlyForecast[];
}

interface HourlyForecast {
  tempC: string;
  tempF: string;
  weatherCode: string;
  weatherDesc: WeatherDescription[];
}

interface WeatherDescription {
  value: string;
}

async function fetchWeatherData(): Promise<WeatherResponse> {
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
