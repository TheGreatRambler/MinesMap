// WeatherDisplay.tsx
import { Component } from 'solid-js';
import WeatherIcon from './WeatherIcon';

interface WeatherDisplayProps {
  weatherCode: number;
  temperature: number;
  class: string;
}

const WeatherDisplay: Component<WeatherDisplayProps> = ({ weatherCode, temperature, class: className }) => {
  return (
    <div class={`${className} bg-gray-300 rounded-[32px] flex items-center justify-center`}>
      <WeatherIcon weatherCode={weatherCode} class="me-8" />
      <p class="col-span-1 text-5xl m-0 font-oswald font-bold">{temperature}°</p>
    </div>
  );
};

export default WeatherDisplay;