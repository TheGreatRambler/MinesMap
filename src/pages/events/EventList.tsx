import { fetchEventsForRoom, RoomEvent } from './events';
import { Room } from '../map/Room';
import { Component, createEffect, createSignal } from 'solid-js';

const EventList: Component<{ room: Room, class: string }> = ({ room, class: className }) => {
  const [curEvents, setEvents] = createSignal<RoomEvent[]>(undefined);
  createEffect(() => {
    // This magic combination makes it actually synchronize the fetch state.
    // Fixed by Github copilot.
    fetchEventsForRoom(room).then((events) => {
      setEvents(() => {
        if (events == null) {
          return [];
        }
        return events;
      });
    });
  }, [room]);

  return (
    <div class={`w-full flex flex-col gap-4 transition-all ease-in-out duration-500 ${className} ${curEvents() !== null && curEvents() !== undefined ? "opacity-full" : "opacity-0"}`}>
      {curEvents() !== null && curEvents() !== undefined && curEvents().length > 0 ? curEvents().map((event) => (
        <button class={`w-full rounded-2xl  flex flex-col p-4 bg-gray-400 justify-center items-center"}`}>
          <p class="text-xl font-open-sans font-bold">{event.group}</p>
          <p class="text-l font-open-sans">{event.name}</p>
          <p class="text-l font-open-sans italic">{event.startTime} to {event.endTime}</p>
        </button>
      )) : (
        curEvents() === undefined ? <p class="text-2xl font-open-sans font-bold text-white text-center">Loading...</p> : (
        curEvents() === null ? <p class="text-2xl font-open-sans font-bold text-white text-center">Failed to fetch events</p> : (
        <p class="text-2xl font-open-sans font-bold text-white text-center">No events found</p>
        )))
      }
    </div>
  );
}

export default EventList;