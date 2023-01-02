import { z } from "zod";
import type { Player } from "./player";

export type PlayerStatsSchema = z.infer<typeof PlayerStats.CODEC>;

export class PlayerStats {
    static readonly CODEC = z.object({
        maxBits: z.number(),
    }).partial();

    static readonly DEFAULTS = {
        maxBits: 0,
    } as const;

    get schema(): PlayerStatsSchema {
        return PlayerStats.CODEC.parse(this);
    } set schema(schema: PlayerStatsSchema | undefined) {
        schema ??= {};
        this.maxBits = schema.maxBits ?? PlayerStats.DEFAULTS.maxBits;
    }

    private maxBits: number = 0;
    private chipCount: number = 0;
    private boughtCloud: boolean = false;

    private _bitsPerSecond: number = 0;
    get bitsPerSecond(): number {
        return this._bitsPerSecond;
    } private set bitsPerSecond(bitsPerSecond: number) {
        this._bitsPerSecond = bitsPerSecond;
    }

    get chipsUnlocked(): boolean {
        return this.chipCount > 0 || this.maxBits > 25;
    }

    get cloudUnlocked(): boolean {
        return this.boughtCloud || this.maxBits >= 256;
    }

    get internetUnlocked(): boolean {
        return this.cloudUnlocked;
    }

    update(player: Player) {
        if(player.bits > this.maxBits) this.maxBits = player.bits;
        this.chipCount = player.chips.length;
        this.boughtCloud = player.cloud !== null;
        this.bitsPerSecond = player.chips.reduce((bps, chip) => bps + chip.bitsPerSecond, 0);
    }
}