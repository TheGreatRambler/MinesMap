import type { Component } from 'solid-js';
import { Link, useRoutes, useLocation } from '@solidjs/router';
import { onMount, createSignal } from 'solid-js';

import { routes } from '../routes';

import rainy from './assets/rainy.svg';

const getTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  return formattedTime;
};

const App: Component = () => {
  const location = useLocation();
  const Route = useRoutes(routes);

  const [time, setTime] = createSignal(getTime());

  onMount(() => {
    const intervalId = setInterval(() => {
      setTime(getTime());
    }, 1000);

    return () => clearInterval(intervalId);
  });

  return (
    <>
      <main class="min-h-screen bg-gray-100">
        <div class="min-h-screen grid grid-cols-2 gap-12 p-12 h-full">
            <div class="col-span-1 grid grid-rows-20 gap-4">
                <div class="row-span-2 grid grid-cols-12 h-full gap-6 rounded-[32px]">
                  <div class="col-span-4 bg-gray-300 h-full rounded-[32px] flex items-center justify-center">
                    <img class="h-20" src="https://brand.mines.edu/wp-content/uploads/sites/425/2023/03/Mines-Logo-150-05.png" />
                  </div>
                  <div class="col-span-4 bg-gray-300 h-full rounded-[32px] flex items-center justify-center">
                  <p class="text-5xl m-0 font-oswald font-bold animate-fadeIn duration-500">{time()}</p>
                  </div>
                  <div class="col-span-4 bg-gray-300 h-full rounded-[32px] flex items-center justify-center">
                    <img class="col-span-1 h-20 me-6" src={rainy} alt="rainy" />
                    <p class="col-span-1 text-5xl m-0 font-oswald font-bold">20°</p>
                  </div>
                </div>
                <div class="row-span-2 rounded-[32px] flex items-center">
                  <p class="text-5xl m-0 font-open-sans font-bold">Map</p>
                </div>
                <div class="row-span-16 bg-gray-300 h-full rounded-[32px]"></div>
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
};

export default App;
