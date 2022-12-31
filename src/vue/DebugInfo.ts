import { db } from "@/ts/db";
import { player } from "@/ts/player";

const data = generate();

function generate() {
    return {
        savedOpacity: Math.max(1 - (Date.now() - player.lastSaveTime) / 5000, 0),
        exportSaveData: () => {
            navigator.clipboard.writeText(player.saveData);
            alert("Save data copied to clipboard!")
        },
        importSaveData: () => player.saveData = prompt("Enter your save data:"),
        resetSaveData: async () => {
            if(confirm("Are you sure you want to reset your save data?")) {
                await db.save.clear();
                location.reload();
            }
        }
    };
}

export function update() {
    Object.assign(data, generate());
}

export default data;