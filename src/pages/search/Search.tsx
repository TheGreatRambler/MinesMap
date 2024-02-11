
import { Component, createSignal, createEffect, Accessor } from 'solid-js';
import { Building } from "../map/Building";
import { Room } from "../map/Room";

const Search: Component<{ selectedRoom: Accessor<Room>, buildings: Building[], switchTo: (roomDetails: string) => void }> = ({ selectedRoom, switchTo }) => {
  const allRooms = [ "MC205", "MC208", "MC209", "MC213", "MC214", "MC215", "MC216", "CK140", "CK155", "CK165", "BB126",
              "BB206", "BB269", "BBW250", "BBW280", "BBW375", "BBW475", "BB242", "BB253", "BBW220", "BBW270", "BB304",
              "AH130", "AH141", "MC141", "MC137", "MC139", "MC135", "MC127", "MC126", "MC111", "MC189", "MC143", "MC119"];
  
  // for (const building of buildings) {
  //   for (const floor of building.floors) {
  //     for (const room of floor.rooms) {
  //       allRooms.push(room.name);
  //     }
  //   }
  // }
  
  const [search, setSearch] = createSignal("");
  const [rooms, setRooms] = createSignal(allRooms);

  createEffect(() => {
    // Don't show anything if search box is empty
    if (search().length == 0) {
      setRooms([]);
      return;
    }

    let filteredItems = allRooms.filter(
      item => item.toLowerCase().includes(search().replace(/\s/g, '').toLowerCase())
    );

    if (filteredItems.length > 5)
      filteredItems = filteredItems.slice(0, 5);

    setRooms(filteredItems);
  });

  return (
    <div class="bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-col transition-all ease-in-out gap-4 duration-500">
      <div class="flex flex-row ">
        <div class="w-full col-span-1">
          <input type="text" class="w-full rounded-2xl border-2 justify-center items-center transition-all ease-in-out duration-500
              rounded-lg py-2 px-4 content-box bg-grey-500" placeholder="Search for any room..."  onInput={(e) => { setSearch(e.target.value); }}
              />
        </div>
      </div>

      {/* Selected: {selectedRoom().name} */}

      {rooms().map((item, idx) =>
        <div class="flex flex-row transition-all ease-in-out duration-500" >
          <div class="w-full col-span-1" >
            <button
              onClick={() => switchTo(item)}
              class={`w-full rounded-2xl w-8 h-8 p-8 flex justify-center items-center transition-all ease-in-out duration-500 content-box bg-gray-300
                      ${selectedRoom() !== undefined && selectedRoom().name == item ? "text-black bg-gray-400" : "bg-gray-300"}`}>
              <p class="text-xl font-open-sans font-bold">{item}</p>
            </button>
  {/*               <button
              onClick={toggleBuilding}
              class="bg-gray-300 w-full rounded-2xl w-8 h-8 mb-4 p-8 flex justify-center items-center"
            >
              <p class="text-xl text-black font-open-sans font-bold">Beck</p>
            </button>
            <button
              onClick={toggleBuilding}
              class="bg-gray-300 w-full rounded-2xl w-8 h-8 p-8 flex justify-center items-center"
            >
              <p class="text-xl text-black font-open-sans font-bold">CTLM</p>
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
