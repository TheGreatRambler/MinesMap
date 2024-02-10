import { createSignal } from 'solid-js';

import rainy from '../assets/rainy.svg';
import Home from './home';
import WeatherIcon from './status/WeatherIcon';
import WeatherDisplay from './status/WeatherDisplay';
import TimeDisplay from './status/TimeDisplay';
// import Logo from './status/Logo';


const getTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  return formattedTime;
};


export default function Visplay() {
  
  const [time, setTime] = createSignal(getTime());


  return (
    <>
      <main class="min-h-screen bg-gray-100">
        <div class="min-h-screen grid grid-cols-2 gap-12 p-12 h-full">
          <div class="col-span-1 grid grid-rows-20 gap-4">
            <div class="row-span-2 grid grid-cols-12 h-full gap-6 rounded-[32px]">
            {/* <Logo class="col-span-4 h-full" /> */}
            <TimeDisplay class="col-span-4 h-full" />
            <WeatherDisplay class="h-full col-span-4" weatherCode={113} temperature={13} />
            </div>
            <div class="row-span-2 rounded-[32px] flex items-center">
            <p class="text-5xl m-0 font-open-sans font-bold">Map</p>
            </div>
            <div class="row-span-16 bg-gray-300 h-full rounded-[32px] overflow-hidden">
            <Home />
            </div>
          </div>

          <div class="col-span-1 grid grid-rows-12 gap-4">
            <div class="row-span-1 rounded-[32px] flex items-center">
            <p class="text-5xl align-middle font-open-sans font-bold">Events</p>
            </div>
            <div class="row-span-6 bg-gray-300 h-full rounded-[32px]"></div>
            <div class="row-span-1 rounded-[32px] flex items-center">
            <p class="text-5xl m-0 font-open-sans font-bold ">Photos</p>
            </div>
            <div class="row-span-4 bg-gray-300 h-full rounded-[32px]"></div>
          </div>
        </div>
      </main>
    </>
  );
}

