// WeatherDisplay.tsx
import { Component, createSignal } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';
import WeatherIcon from './WeatherIcon';
import { fetchWeatherData, WeatherResponse } from '../wttrin/wttrin';

interface WeatherDisplayProps {
  class: string;
}

const WeatherDisplay: Component<WeatherDisplayProps> = ({ class: className }) => {
  const query = createQuery<WeatherResponse>(() => ({queryKey: ['weather'], queryFn: fetchWeatherData}));

  const temperature = query.data?.current_condition[0]?.temp_F;
  const weatherCode = query.data?.current_condition[0]?.weatherCode;

  return (
    <div class={`${className} bg-gray-300 rounded-[32px] flex items-center justify-center`}>
      <WeatherIcon weatherCode={parseInt(weatherCode)} class="me-8" />
      <p class="col-span-1 text-5xl m-0 font-oswald font-bold">{temperature}°</p>
    </div>
  );
};

export default WeatherDisplay;