import { z } from 'zod';

import { Purchase } from './purchase';

import type { Disk } from "./disk";
import { CostManager } from './cost-manager';

export type ChipSchema = z.infer<typeof Chip.CODEC>;

export class Chip {
    static readonly CODEC = z.object({
        clockSpeed: z.number(),
        targetDiskID: z.nullable(z.number()),
    });

    static fromSchema(schema: ChipSchema, disks: Disk[]): Chip {
        const chip = new Chip();
        chip._clockSpeed = schema.clockSpeed;
        chip.targetDisk = disks.find(disk => disk.id === schema.targetDiskID) ?? null;
        return chip;
    }

    private _clockSpeed = 1; /** Unit: Hz */
    get clockSpeed() {
        return this._clockSpeed;
    } private set clockSpeed(clockSpeed: number) {
        this._clockSpeed = clockSpeed;
    }

    public targetDisk: Disk | null = null;

    // used in schema
    private get targetDiskID(): number | null {
        return this.targetDisk?.id ?? null;
    }

    private readonly clockSpeedCostManager: CostManager = new CostManager(150, (amount, prevCost) => {
        return prevCost ** 1.1;
    }, {
        initialAmount: 1,
        incrementer: prevAmount => prevAmount * 2,
    });

    get clockSpeedUpgradePrice(): number {
        return this.clockSpeedCostManager.getNextCostAt(this.clockSpeed);
    }

    private lastUpdate: number = -1;

    get name(): string {
        return `${this.clockSpeed}Hz Chip`;
    }

    get clockSpeedUpgrade(): Purchase {
        return new Purchase(
            "x2 Clock Speed",
            this.clockSpeedUpgradePrice,
            () => this._clockSpeed *= 2,
        );
    }

    get schema(): ChipSchema {
        return Chip.CODEC.parse(this);
    }

    get bitsPerSecond(): number {
        return this.targetDisk !== null && !this.targetDisk.isFull ? this.clockSpeed : 0;
    }

    cycle(): void {
        if(this.targetDisk === null) return;

        if(this.lastUpdate === -1) this.lastUpdate = performance.now();

        const timeBetweenCycles = (1000 / this.clockSpeed);
        while(performance.now() >= this.lastUpdate + timeBetweenCycles) {
            this.targetDisk.increment();
            this.lastUpdate += timeBetweenCycles;
        }
    }
}