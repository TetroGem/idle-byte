import { z } from 'zod';

import { Chip } from './chip';
import { CostManager } from './cost-manager';
import { db } from './db';
import { Disk } from './disk';
import { Purchase } from './purchase';
import { base64ToUTF8, utf8ToBase64 } from './util/crypt';
import { PlayerStats } from './player-stats';

export type SaveDataSchema = z.infer<typeof Player.SAVE_DATA_CODEC>;

export class Player {
    static readonly INSTANCE = new Player();

    static readonly SAVE_DATA_CODEC = z.object({
        disks: z.array(Disk.CODEC),
        chips: z.array(Chip.CODEC),
        stats: PlayerStats.CODEC,
    });

    private constructor() { }

    private _bits: number = 0;
    get bits(): number {
        return this._bits;
    } private set bits(bits: number) {
        this._bits = bits;
    }

    private _disks: Disk[] = [
        new Disk(0, 4),
    ];
    get disks(): Disk[] {
        return this._disks;
    } private set disks(disks: Disk[]) {
        this._disks = disks;
    } 

    private _chips: Chip[] = [];
    get chips(): Chip[] {
        return this._chips;
    } private set chips(chips: Chip[]) {
        this._chips = chips;
    }

    private _diskCostManager: CostManager = new CostManager(
        10,
        (amount, prevCost) => {
            if(amount < 4) return prevCost ** 1.15;
            else return prevCost ** 1.9;
        },
        {
            initialAmount: 1,
        },
    );

    private _chipCostManager: CostManager = new CostManager(
        100,
        (amount, prevCost) => {
            if(amount < 4) return prevCost ** 1.15;
            else return prevCost ** 1.9;
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
            "Buy 4b Disk",
            this.nextDiskCost,
            player => {
                player.disks.push(new Disk(this.disks.length, 4));
                
            },
        );
    }

    get nextChipPurchase(): Purchase {
        return new Purchase(
            "Buy 1Hz Chip",
            this.nextChipCost,
            player => {
                player.chips.push(new Chip());
            },
        );
    }

    private _selection: Disk | Chip | null = null;
    get selection(): Disk | Chip | null {
        return this._selection;
    } private set selection(selection: Disk | Chip | null) {
        this._selection = selection;
    }

    get maxStorage(): number {
        return this.disks.reduce((total, disk) => total += disk.capacity, 0);
    }

    get schema(): SaveDataSchema {
        return Player.SAVE_DATA_CODEC.parse(this);
    }

    get saveData(): string {
        return utf8ToBase64(JSON.stringify(this.schema));
    } set saveData(data: string | null) {
        if(data == null) return;

        const parsed = JSON.parse(base64ToUTF8(data));
        const decoded = Player.SAVE_DATA_CODEC.parse(parsed);
        console.log(decoded);
        this.disks = decoded.disks.map(disk => Disk.fromSchema(disk));
        this.chips = decoded.chips.map(chip => Chip.fromSchema(chip, this.disks));
        this.stats.schema = decoded.stats;
        console.log("Imported save data!");
    }

    private _lastSaveTime: number = -1;
    get lastSaveTime(): number {
        return this._lastSaveTime;
    } private set lastSaveTime(lastSaveTime: number) {
        this._lastSaveTime = lastSaveTime;
    }

    readonly stats: PlayerStats = new PlayerStats();

    depleteBits(bits: number): void {
        let diskIndex = this.disks.length - 1;
        while(bits > 0) {
            const disk = this.disks[diskIndex];
            bits -= disk.drain(bits);
            diskIndex--;
        }
    }

    save(): void {
        db.save.put({
            data: this.saveData,
        }, 0);
        console.log("Saved!");
        this.lastSaveTime = performance.now();
    }

    update(): void {
        if(this.lastSaveTime === -1) this.lastSaveTime = performance.now();

        if(performance.now() >= this.lastSaveTime + 10000) this.save();

        for(const chip of this.chips) {
            chip.cycle();
        }
        this.bits = this.disks.reduce((totalBits, disk) => totalBits += disk.bits, 0);

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
            this.depleteBits(cost)
            callback(this);
        }
    }
}

export const player = Player.INSTANCE;