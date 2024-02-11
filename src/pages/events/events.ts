import { Room } from "../map/Room";

export interface RoomEvent {
  name: string;
  group: string;
  startTime: string;
  endTime: string;
}

export function fetchEventsForRoomTask(room: Room) {
  return async () => { return await fetchEventsForRoom(room); };
}

export async function fetchEventsForRoom(room: Room): Promise<RoomEvent[]> {
  try {
    const response = await fetch(`http://localhost:3001/events?buildingCode=${room.building.code}&roomNumber=${room.number}`);

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const events = await response.json();

    console.log(events)
    return events;
  } catch (error) {
    console.error('An error occurred while fetching the events:', error);
    return null;
  } 
}
