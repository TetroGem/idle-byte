import { player } from "@/ts/player";

const data = generate();

function generate() {
    return {
        savedOpacity: Math.max(1 - (performance.now() - player.lastSaveTime) / 5000, 0),
        exportSaveData: () => prompt("Copy your save data from below:", player.saveData),
        importSaveData: () => player.saveData = prompt("Enter your save data:"),
    };
}

export function update() {
    Object.assign(data, generate());
}

export default data;