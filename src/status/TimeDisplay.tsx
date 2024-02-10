import { onMount, createSignal, Component } from 'solid-js';

const getTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  return formattedTime;
};

export interface TimeDisplayProps {
  class: string;
}

const TimeDisplay: Component<TimeDisplayProps> = ({ class: className }) => {
  const [time, setTime] = createSignal(getTime());

  onMount(() => {
    const intervalId = setInterval(() => {
      setTime(getTime());
    }, 1000);

    return () => clearInterval(intervalId);
  });

  return (
    <div class={`${className} bg-gray-300 rounded-[32px] flex items-center justify-center`}>
      <p class="text-5xl m-0 font-oswald font-bold animate-fadeIn duration-500">{time()}</p>
    </div>
  );
};

export default TimeDisplay;