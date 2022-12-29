import { z } from 'zod';

import { Purchase } from './purchase';

import type { Disk } from "./disk";

export type ChipSchema = z.infer<typeof Chip.CODEC>;

export class Chip {
    static readonly CODEC = z.object({
        clockSpeed: z.number(),
    });

    static fromSchema(schema: ChipSchema): Chip {
        const chip = new Chip();
        chip._clockSpeed = schema.clockSpeed;
        return chip;
    }

    private _clockSpeed = 1; /** Unit: Hz */
    private _targetDisk: Disk | null = null;
    private _clockSpeedUpgradePrice = 150;
    private _lastUpdate: number = -1;

    get name(): string {
        return `${this._clockSpeed}Hz Chip`;
    }

    get clockSpeedUpgrade(): Purchase {
        return new Purchase(
            "x2 Clock Speed",
            this._clockSpeedUpgradePrice,
            () => {
                this._clockSpeed *= 2;
                this._clockSpeedUpgradePrice **= 1.1;
            }
        );
    }

    get targetDisk() {
        return this._targetDisk;
    }

    set targetDisk(disk: Disk | null) {
        this._targetDisk = disk;
    }

    cycle(): void {
        if(this._targetDisk === null) return;

        if(this._lastUpdate === -1) this._lastUpdate = performance.now();

        const timeBetweenCycles = (1000 / this._clockSpeed);
        while(performance.now() >= this._lastUpdate + timeBetweenCycles) {
            this._targetDisk.increment();
            this._lastUpdate += timeBetweenCycles;
        }
    }

    get clockSpeed() {
        return this._clockSpeed;
    }

    get schema(): ChipSchema {
        return Chip.CODEC.parse(this);
    }
}