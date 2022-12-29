import { z } from 'zod';

import { Chip } from './chip';
import { CostManager } from './cost-manager';
import { db } from './db';
import { Disk } from './disk';
import { Purchase } from './purchase';
import { base64ToUTF8, utf8ToBase64 } from './util/crypt';

export type SaveDataSchema = z.infer<typeof Player.SAVE_DATA_CODEC>;

export class Player {
    static readonly INSTANCE = new Player();

    static readonly SAVE_DATA_CODEC = z.object({
        disks: z.array(Disk.CODEC),
        chips: z.array(Chip.CODEC),
    });

    private _bits: number = 0;
    private _disks: Disk[] = [
        new Disk(0, 4),
    ];
    private _chips: Chip[] = [];

    private _diskCostManager: CostManager = new CostManager(
        10,
        (amount, prevCost) => {
            if(amount < 4) return prevCost ** 1.15;
            else return prevCost ** 1.9;
        },
        1,
    );
    private _chipCostManager: CostManager = new CostManager(
        100,
        (amount, prevCost) => {
            if(amount < 4) return prevCost ** 1.15;
            else return prevCost ** 1.9;
        },
    );

    private _selection: Disk | Chip | null = null;
    private _lastSave: number = -1;

    private constructor() { }

    get bits(): number {
        return this._bits;
    }

    get disks(): Disk[] {
        return this._disks;
    }

    get chips(): Chip[] {
        return this._chips;
    }

    get nextDiskCost(): number {
        return this._diskCostManager.getFor(this.disks.length);
    }

    get nextChipCost(): number {
        return this._chipCostManager.getFor(this.chips.length);
    }

    get nextDiskPurchase(): Purchase {
        return new Purchase(
            "Buy 4b Disk",
            this.nextDiskCost,
            player => {
                player._disks.push(new Disk(this._disks.length, 4));
                
            },
        );
    }

    get nextChipPurchase(): Purchase {
        return new Purchase(
            "Buy 1Hz Chip",
            this.nextChipCost,
            player => {
                player._chips.push(new Chip());
            },
        );
    }

    depleteBits(bits: number): void {
        let diskIndex = this._disks.length - 1;
        while(bits > 0) {
            const disk = this._disks[diskIndex];
            bits -= disk.drain(bits);
            diskIndex--;
        }
    }

    update(): void {
        if(this._lastSave === -1) this._lastSave = performance.now();

        if(performance.now() >= this._lastSave + 3000) {
            db.save.put({
                data: this.saveData,
            }, 0);
            console.log("Saved!");
            this._lastSave = performance.now();
        }

        this._bits = this._disks.reduce((totalBits, disk) => totalBits += disk.bits, 0);
        for(const chip of this._chips) {
            chip.cycle();
        }
    }

    interactWithDisk(disk: Disk): void {
        this._selection = disk;
        disk.increment();
    }

    interactWithChip(chip: Chip): void {
        this._selection = chip;
    }

    get selection(): Disk | Chip | null {
        return this._selection;
    }

    canAfford(cost: number): boolean {
        return this._bits >= cost;
    }

    buyPurchase(purchase: Purchase): void {
        const { cost, callback } = purchase;

        if(this.canAfford(cost)) {
            this.depleteBits(cost)
            callback(this);
        }
    }

    get maxStorage(): number {
        return this.disks.reduce((total, disk) => total += disk.capacity, 0);
    }

    get schema(): SaveDataSchema {
        return Player.SAVE_DATA_CODEC.parse(this);
    }

    get saveData(): string {
        return utf8ToBase64(JSON.stringify(this.schema));
    }

    set saveData(data: string) {
        const parsed = JSON.parse(base64ToUTF8(data));
        const decoded = Player.SAVE_DATA_CODEC.parse(parsed);
        console.log(decoded);
        this._disks = decoded.disks.map(disk => Disk.fromSchema(disk));
        this._chips = decoded.chips.map(chip => Chip.fromSchema(chip));
        console.log("Imported save data!");
    }
}

export const player = Player.INSTANCE;