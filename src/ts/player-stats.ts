import { z } from "zod";
import type { Player } from "./player";

export class PlayerStats {
    static readonly CODEC = z.object({
        maxBits: z.number(),
    });

    private maxBits: number = 0;
    private chipCount: number = 0;

    private _bitsPerSecond: number = 0;
    get bitsPerSecond(): number {
        return this._bitsPerSecond;
    } private set bitsPerSecond(bitsPerSecond: number) {
        this._bitsPerSecond = bitsPerSecond;
    }

    get schema(): z.infer<typeof PlayerStats.CODEC> {
        return PlayerStats.CODEC.parse(this);
    }

    set schema(schema: z.infer<typeof PlayerStats.CODEC>) {
        this.maxBits = schema.maxBits;
    }

    update(player: Player) {
        if(player.bits > this.maxBits) this.maxBits = player.bits;
        this.chipCount = player.chips.length;
        this.bitsPerSecond = player.chips.reduce((bps, chip) => bps + chip.bitsPerSecond, 0);
    }

    get chipsUnlocked(): boolean {
        return this.chipCount > 0 || this.maxBits >= 50;
    }
}