import { createSignal, onCleanup, onMount } from 'solid-js';
import Hammer, {HammerInput} from 'hammerjs';

const Mobile = () => {
  const [divRef, setDivRef] = createSignal<HTMLDivElement | null>(null);
  const [websocket, setWebsocket] = createSignal<WebSocket | null>(null);

  let hammer: Hammer;

  onMount(() => {
    const ws = new WebSocket('ws://10.60.211.99:3001/gestures/write');
    setWebsocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    const currentDivRef = divRef();
    if (currentDivRef && !hammer) {
      hammer = new Hammer(currentDivRef);
      hammer.get('pinch').set({ enable: true });
      hammer.on('pan', handlePan);
      hammer.on('pinchin', handlePinch);
      hammer.on('pinchout', handlePinch);
      hammer.on('press', handlePress);
      hammer.on('tap', handleTap);
      hammer.on('swipe', handleSwipe);
    }
  });

  onCleanup(() => {
    const currentDivRef = divRef();
    if (currentDivRef && hammer) {
      hammer.off('pan');
      hammer.off('pinch');
      hammer.off('tap');
    }

    const ws = websocket();
    if (ws && ws.readyState === WebSocket.OPEN) { // Check if WebSocket connection is open
      ws.close();
    }
  });

  const handlePan = (event: HammerInput) => {
    const ws = websocket();
    if (ws && ws.readyState === WebSocket.OPEN) { // Check if WebSocket connection is open
      if (event.distance > 200) {
        return;
      }
      divRef().innerHTML = `pan ${event.direction}`;
      if (event.direction === 2) {
        ws.send(`PAN:LEFT:${event.distance}`);
      } else if (event.direction === 4) {
        ws.send(`PAN:RIGHT:${event.distance}`);
      } else if (event.direction === 8) {
        ws.send(`PAN:UP:${Math.abs(event.distance)}`);
      } else if (event.direction === 16) {
        ws.send(`PAN:DOWN:${Math.abs(event.distance)}`);
      }
    }
  };

  const handlePinch = (event: HammerInput) => {
    const ws = websocket();
    if (ws && ws.readyState === WebSocket.OPEN) { // Check if WebSocket connection is open
      divRef().innerHTML = `pinch ${event.scale}`;
      if (event.direction === 2) {
        ws.send(`PINCH:LEFT:${event.distance}`);
      } else if (event.direction === 4) {
        ws.send(`PINCH:RIGHT:${event.distance}`);
      } else if (event.direction === 8) {
        ws.send(`PINCH:UP:${event.distance}`);
      } else if (event.direction === 16) {
        ws.send(`PINCH:DOWN:${event.distance}`);
      }
    }
  };

  const handleTap = () => {
    const ws = websocket();
    if (ws && ws.readyState === WebSocket.OPEN) { // Check if WebSocket connection is open
      divRef().innerHTML = `tap`;
      ws.send(`TAP:TAP:TAP`);
    }
  };

  const handlePress = () => {
    const ws = websocket();
    if (ws && ws.readyState === WebSocket.OPEN) { // Check if WebSocket connection is open
      divRef().innerHTML = `tap`;
      ws.send(`PRESS:PRESS:PRESS`);
    }
  };

  const handleSwipe = (event: HammerInput) => {
    const ws = websocket();
    if (ws && ws.readyState === WebSocket.OPEN) { // Check if WebSocket connection is open
      divRef().innerHTML = `rotate ${event.rotation}`;
      if (event.direction === 2) {
        ws.send(`SWIPE:LEFT:${event.distance}`);
      } else if (event.direction === 4) {
        ws.send(`SWIPE:RIGHT:${event.distance}`);
      }
    }
  };

  return (
    <>
      <div ref={setDivRef} class="h-screen w-screen bg-gray-500">
        test
      </div>
    </>
  );
};

export default Mobile;