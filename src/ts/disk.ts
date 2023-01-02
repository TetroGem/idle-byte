import { z } from 'zod';

import { Purchase } from './purchase';
import { Strings } from './util/strings';
import { formatBits } from './format';
import { CostManager } from './cost-manager';

export type DiskSchema = z.infer<typeof Disk.CODEC>;

export class Disk {
    static readonly DEFAULTS = {
        capacity: 8,
        bits: 0,
    } as const;

    static readonly CODEC = z.object({
        capacity: z.number().default(Disk.DEFAULTS.capacity),
        bits: z.number().default(Disk.DEFAULTS.bits),
        id: z.number(),
    });

    static fromSchema(schema: DiskSchema): Disk {
        const disk = new Disk(schema.id, schema.capacity);
        disk.floatBits = schema.bits;
        return disk;
    }

    readonly id: number;

    get diskLetter() {
        let letterID = this.id + 2;
        const digits = [];
        while(letterID > 0) {
            const nextDigit = letterID % 26 + 1;
            letterID = (letterID - nextDigit) / 26;
            digits.push(nextDigit);
        }

        return digits.reduce((letters, digit) => String.fromCharCode(64 + digit) + letters, "");
    }

    get nameWithoutLetter() {
        return `${formatBits(this.capacity, true)} Disk`;
    }

    get name() {
        return `${this.nameWithoutLetter} (${this.diskLetter}:)`;
    }

    _capacity: number = Disk.DEFAULTS.capacity;
    get capacity() {
        return this._capacity;
    } private set capacity(capacity: number) {
        this._capacity = capacity;
    }

    private readonly capacityCostManager;

    get capacityPurchase(): Purchase {
        return new Purchase(
            "x2 Capacity",
            this.capacityCostManager.getNextCostAt(this.capacity),
            () => this.capacity *= 2,
        );
    }

    private floatBits: number = Disk.DEFAULTS.bits;

    get bits() {
        return Math.floor(this.floatBits);
    }

    get isFull(): boolean {
        return this.bits >= this.capacity;
    }

    get schema(): DiskSchema {
        return Disk.CODEC.parse(this);
    }

    constructor(id: number, capacity: number) {
        this.id = id;
        this.capacity = capacity;
        this.capacityCostManager = new CostManager(
            16 * (1.05 ** this.id),
            (amount, prevCost) => prevCost ** 1.07,
            {
                initialAmount: 8,
                incrementer: prevAmount => prevAmount * 2,
            }
        );
    }

    increment(bits: number = 1): void {
        this.floatBits = Math.min(this.floatBits + bits, this.capacity);
        // if(this.value >= 2 ** this.storage) this.value = 0; // overflow
    }

    /**
     * @param bits The maximum number of bits to deplete from this disk (can be larger than current value)
     * @returns The number of bits that were able to be removed from this disk
     */
    drain(bits: number): number {
        const depleted = Math.min(bits, this.bits);
        this.floatBits -= depleted;
        return depleted;
    }

    upgradeStorage(): void {
        this.capacity *= 2;
    }
}