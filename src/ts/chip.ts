import { z } from 'zod';

import { Purchase } from './purchase';

import type { Disk } from "./disk";
import { CostManager } from './cost-manager';
import { formatHertz } from './format';

export type ChipSchema = z.infer<typeof Chip.CODEC>;

export class Chip {
    static readonly OVERCLOCK_LENGTH_MILLIS = 5000;
    static readonly OVERCLOCK_COOLDOWN_MILLIS = 15000;

    static readonly DEFAULTS = {
        clockSpeed: 1,
        overclock: 0,
        lastOverclockTime: -1,
        targetDisk: null,
    } as const;

    static readonly CODEC = z.object({
        clockSpeed: z.number().default(Chip.DEFAULTS.clockSpeed),
        overclock: z.number().default(Chip.DEFAULTS.overclock),
        lastOverclockTime: z.number().default(Chip.DEFAULTS.lastOverclockTime),
        targetDiskID: z.nullable(z.number()).default(Chip.DEFAULTS?.targetDisk ?? null),
    });


    static fromSchema(schema: ChipSchema, disks: Disk[]): Chip {
        const chip = new Chip();

        chip.clockSpeed = schema.clockSpeed;
        chip.overclock = schema.overclock;
        chip.lastOverclockTime = schema.lastOverclockTime;
        chip.targetDisk = disks.find(disk => disk.id === schema.targetDiskID) ?? null;

        return chip;
    }

    private _clockSpeed: number = Chip.DEFAULTS.clockSpeed; /** Unit: Hz */
    get clockSpeed() {
        return this._clockSpeed;
    } private set clockSpeed(clockSpeed: number) {
        this._clockSpeed = clockSpeed;
    }

    private _overclock: number = Chip.DEFAULTS.overclock;
    get overclock(): number {
        return this._overclock;
    } private set overclock(overclock: number) {
        this._overclock = overclock;
    }

    private lastOverclockTime: number = Chip.DEFAULTS.lastOverclockTime;

    public targetDisk: Disk | null = Chip.DEFAULTS.targetDisk;

    // used in schema
    private get targetDiskID(): number | null {
        return this.targetDisk?.id ?? null;
    }

    private readonly clockSpeedCostManager: CostManager = new CostManager(
        110,
        (amount, prevCost) => prevCost ** 1.09,
        {
            initialAmount: 1,
            incrementer: prevAmount => prevAmount * 2,
        }
    );

    private readonly overclockCostManager: CostManager = new CostManager(
        8 * 1024 ** 2,
        (amount, prevCost) => prevCost ** 1.5,
    );

    private lastUpdate: number = -1;

    get name(): string {
        return `${formatHertz(this.clockSpeed, true)} Chip`;
    }

    get clockSpeedPurchase(): Purchase {
        return new Purchase(
            "x2 Clock Speed",
            this.clockSpeedCostManager.getNextCostAt(this.clockSpeed),
            () => this.clockSpeed *= 2,
        );
    }

    get overclockPurchase(): Purchase {
        return new Purchase(
            "Overclocking",
            this.overclockCostManager.getNextCostAt(this.overclock),
            () => this.overclock++,
        );
    }

    get schema(): ChipSchema {
        return Chip.CODEC.parse(this);
    }

    private get activeClockSpeed(): number {
        const overclockMultiplier = this.isOverclocking ? 32 ** this.overclock : 1;
        const activeClockSpeed = this.clockSpeed * overclockMultiplier;
        return activeClockSpeed;
    }

    get bitsPerSecond(): number {
        return this.targetDisk !== null && !this.targetDisk.isFull ? this.activeClockSpeed : 0;
    }

    get isOverclocking(): boolean {
        return this.overclock > 0 && Date.now() - this.lastOverclockTime <= Chip.OVERCLOCK_LENGTH_MILLIS;
    }

    get overclockProgress(): number {
        return Math.min(1, (Date.now() - this.lastOverclockTime) / Chip.OVERCLOCK_LENGTH_MILLIS);
    }

    get overclockCooldownProgress(): number {
        return Math.min(1, (Date.now() - this.lastOverclockTime) / Chip.OVERCLOCK_COOLDOWN_MILLIS);
    }

    cycle(): void {
        if(this.targetDisk === null) return;

        if(this.lastUpdate === -1) this.lastUpdate = Date.now();

        const millisPerCycle = (1000 / this.activeClockSpeed);
        const deltaMillis = Date.now() - this.lastUpdate;
        this.targetDisk.increment(deltaMillis / millisPerCycle);
        this.lastUpdate = Date.now();
    }

    activateOverclock() {
        if(Date.now() - this.lastOverclockTime < Chip.OVERCLOCK_COOLDOWN_MILLIS) return;

        this.lastOverclockTime = Date.now();
    }
}