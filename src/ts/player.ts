import { z } from 'zod';

import { Chip } from './chip';
import { CostManager } from './cost-manager';
import { db } from './db';
import { Disk } from './disk';
import { Purchase } from './purchase';
import { base64ToUTF8, utf8ToBase64 } from './util/crypt';
import { PlayerStats } from './player-stats';
import { Cloud } from './cloud';
import { formatBits } from './format';

export type SaveDataSchema = z.infer<typeof Player.SAVE_DATA_CODEC>;

export type PlayerSelection = Disk | Chip | Cloud | null;

export class Player {
    private static readonly DEFAULTS = {
        get disks() {
            return [ new Disk(0, 8) ];
        },
        get chips() {
            return [];
        },
        cloud: null,
        get stats() {
            return new PlayerStats();
        }
    } as const;

    static readonly SAVE_DATA_CODEC = z.object({
        disks: z.array(Disk.CODEC).default(Player.DEFAULTS.disks),
        chips: z.array(Chip.CODEC).default(Player.DEFAULTS.chips),
        cloud: z.nullable(Cloud.CODEC).default(Player.DEFAULTS.cloud),
        stats: PlayerStats.CODEC.default(Player.DEFAULTS.stats.schema),
    }).partial();

    static readonly AUTOSAVE_COOLDOWN = 10000;
    static readonly INSTANCE = new Player();

    private constructor() { }

    private _bits: number = 0;
    get bits(): number {
        return this._bits;
    } private set bits(bits: number) {
        this._bits = bits;
    }

    private _cloud: Cloud | null = Player.DEFAULTS.cloud;
    get cloud(): Cloud | null {
        return this._cloud;
    } private set cloud(cloud: Cloud | null) {
        this._cloud = cloud;
    }

    get cloudPurchase(): Purchase {
        return new Purchase(
            "Buy Cloud Storage",
            325,
            player => player.cloud = new Cloud(),
        )
    }

    get bitsOnDisks(): number {
        // console.log(this.disks);
        return this.disks.reduce((totalBits, disk) => totalBits += disk.bits, 0);
    }

    get bitsOnCloud(): number {
        return this.cloud?.bits ?? 0;
    }

    private _disks: Disk[] = Player.DEFAULTS.disks;
    get disks(): Disk[] {
        return this._disks;
    } private set disks(disks: Disk[]) {
        this._disks = disks;
    } 

    private _chips: Chip[] = Player.DEFAULTS.chips;
    get chips(): Chip[] {
        return this._chips;
    } private set chips(chips: Chip[]) {
        this._chips = chips;
    }

    private _diskCostManager: CostManager = new CostManager(
        6,
        (amount, prevCost) => {
            if(amount < 4) return prevCost ** 2.1;
            else return prevCost ** 2.5;
        },
        {
            initialAmount: 1,
        },
    );

    private _chipCostManager: CostManager = new CostManager(
        100,
        (amount, prevCost) => {
            if(amount < 4) return prevCost ** 1.15;
            else return prevCost ** 1.75;
        },
    );

    get nextDiskCost(): number {
        return this._diskCostManager.getNextCostAt(this.disks.length);
    }

    get nextChipCost(): number {
        return this._chipCostManager.getNextCostAt(this.chips.length);
    }

    get nextDiskPurchase(): Purchase {
        return new Purchase(
            `Buy ${formatBits(8, true)} Disk`,
            this.nextDiskCost,
            player => player.disks.push(new Disk(this.disks.length, 8)),
        );
    }

    get nextChipPurchase(): Purchase {
        return new Purchase(
            "Buy 1 Hz Chip",
            this.nextChipCost,
            player => {
                player.chips.push(new Chip());
            },
        );
    }

    private _selection: PlayerSelection = null;
    get selection(): PlayerSelection {
        return this._selection;
    } private set selection(selection: PlayerSelection) {
        this._selection = selection;
    }

    get maxStorage(): number {
        return this.disks.reduce((total, disk) => total += disk.capacity, 0);
    }

    get schema(): SaveDataSchema {
        return Player.SAVE_DATA_CODEC.parse(this);
    } private set schema(schema: SaveDataSchema) {
        this.disks = schema.disks?.map(disk => Disk.fromSchema(disk)) ?? Player.DEFAULTS.disks;
        this.chips = schema.chips?.map(chip => Chip.fromSchema(chip, this.disks)) ?? Player.DEFAULTS.chips;
        this.cloud = schema.cloud ? Cloud.fromSchema(schema.cloud) : Player.DEFAULTS.cloud;
        this.stats.schema = schema.stats;
        console.log("Imported save data!");
    }

    get saveData(): string {
        return utf8ToBase64(JSON.stringify(this.schema));
    } set saveData(data: string | null) {
        if(data == null) return;

        const parsed = JSON.parse(base64ToUTF8(data));
        const decoded = Player.SAVE_DATA_CODEC.parse(parsed);
        this.schema = decoded;
    }

    private _lastSaveTime: number = Date.now();
    get lastSaveTime(): number {
        return this._lastSaveTime;
    } private set lastSaveTime(lastSaveTime: number) {
        this._lastSaveTime = lastSaveTime;
    }

    get timeUntilAutosave(): number {
        return this.lastSaveTime + Player.AUTOSAVE_COOLDOWN - Date.now();
    }

    readonly stats: PlayerStats = Player.DEFAULTS.stats;

    private decrementBits(bits: number): void {
        const requestedBitsToDrain = bits;
        let totalDrained = 0;

        // drain bits from disks first
        const drainedFromDisks = this.drainDisks(bits);
        // console.log(`Drained ${drainedFromDisks} bits from disks`);
        totalDrained += drainedFromDisks;
        bits -= drainedFromDisks;

        // then from cloud
        if(bits > 0 && this.cloud !== null) {
            const drainedFromCloud = this.cloud.drain(bits);
            console.log(`Drained ${drainedFromCloud} bits from cloud`);
            totalDrained += drainedFromCloud;
            bits -= drainedFromCloud;
        }

        // these should not be possible
        if(bits > 0) {
            alert("SERIOUS ERROR: Not enough bits to decrement!");
            throw new Error("SERIOUS ERROR: Not enough bits to decrement!");
        }
        if(totalDrained > requestedBitsToDrain) {
            alert("SERIOUS ERROR: Drained too many bits!");
            throw new Error("SERIOUS ERROR: Drained too many bits!");
        }
    }

    private drainDisks(bits: number): number {
        const drainRecursive = (bits: number, disks: Disk[]): number => {
            disks = disks.filter(disk => disk.bits > 0);
            if(bits <= 0 || disks.length === 0) return 0;

            let minBits = bits; // least amount of bits on a disk (or the amount to remove from all of them this round)
            const sortedDisks = disks.slice().sort((a, b) => {
                minBits = Math.min(minBits, a.bits, b.bits);
                return (b.bits / b.capacity - a.bits / a.capacity) || (b.capacity - a.capacity);
            });
            // if(minBits * sortedDisks.length > bits) minBits = Math.ceil(bits / sortedDisks.length);

            // remove the minBits from each disk, starting with the one that has the most bits on it
            let drained = 0;
            for(const disk of sortedDisks) {
                const diskDrained = disk.drain(Math.min(minBits, bits));
                drained += diskDrained;
                bits -= diskDrained;
                if(bits <= 0) break;
            }

            // if we still have bits left, we need to remove more bits from each disk,
            // minus the one with the least bits on it (it should be empty now)
            return drainRecursive(bits, sortedDisks) + drained;
        }

        const totalDrained = drainRecursive(bits, this.disks);
        if(totalDrained > bits) {
            alert("SERIOUS ERROR: Drained more bits than requested!");
            throw new Error("SERIOUS ERROR: Drained more bits than requested!");
        }
        return totalDrained;
    }

    save(): void {
        db.save.put({
            data: this.saveData,
        }, 0);
        console.log("Saved!");
        this.lastSaveTime = Date.now();
    }

    update(): void {
        if(this.lastSaveTime === -1) this.lastSaveTime = Date.now();

        if(Date.now() >= this.lastSaveTime + Player.AUTOSAVE_COOLDOWN) this.save();

        for(const chip of this.chips) {
            chip.cycle();
        }
        if(this.cloud !== null) {
            const uploadedBits = this.cloud.upload(this.bitsOnDisks);
            this.drainDisks(uploadedBits);
        }
        this.bits = this.bitsOnDisks + this.bitsOnCloud;

        this.stats.update(this);
    }

    interactWithDisk(disk: Disk): void {
        this.selection = disk;
        disk.increment();
    }

    interactWithChip(chip: Chip): void {
        this.selection = chip;
    }

    canAfford(cost: number): boolean {
        return this.bits >= cost;
    }

    buyPurchase(purchase: Purchase): void {
        const { cost, callback } = purchase;

        if(this.canAfford(cost)) {
            this.decrementBits(cost);
            callback(this);
        }
    }

    interactWithCloud(): void {
        if(this.cloud === null) return;

        this.cloud.startUpload();
        this.selection = this.cloud;
    }
}

export const player = Player.INSTANCE;