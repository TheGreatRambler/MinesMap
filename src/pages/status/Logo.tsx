// Logo.tsx
import type { Component } from 'solid-js';

interface LogoProps {
  class: string;
}

const Logo: Component<LogoProps> = ({ class: className }) => {
  return (
    <div class={`${className} bg-gray-300 h-full rounded-[32px] flex items-center justify-center`}>
      <img class="h-20" src="https://brand.mines.edu/wp-content/uploads/sites/425/2023/03/Mines-Logo-150-05.png" />
    </div>
  );
};

export default Logo;