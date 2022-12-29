import { z } from 'zod';

import { Purchase } from './purchase';
import { padStart } from './util/strings';

export type DiskSchema = z.infer<typeof Disk.CODEC>;

export class Disk {
    static readonly CODEC = z.object({
        storage: z.number(),
        bits: z.number(),
        id: z.number(),
    });

    static fromSchema(schema: DiskSchema): Disk {
        const disk = new Disk(schema.id, schema.storage);
        disk.bits = schema.bits;
        return disk;
    }

    _storage: number;
    _bits: number = 0;
    _id: number;

    constructor(id: number, storage: number) {
        this._storage = storage;
        this._id = id;
    }

    get storage() {
        return this._storage;
    }
    
    get bits() {
        return this._bits;
    }

    get binaryBits(): string {
        const binary = this._bits.toString(2);
        return padStart(binary, this._storage, "0");
    }

    get capacity() {
        return 2 ** this._storage - 1;
    }

    increment(bits: number = 1): void {
        if(this._bits < this.capacity) this._bits += bits;
        if(this._bits > this.capacity) this._bits = this.capacity;
        // if(this.value >= 2 ** this.storage) this.value = 0; // overflow
    }

    /**
     * @param bits The maximum number of bits to deplete from this disk (can be larger than current value)
     * @returns The number of bits that were able to be removed from this disk
     */
    drain(bits: number): number {
        const depleted = Math.min(bits, this._bits);
        this._bits -= depleted;
        return depleted;
    }

    private set bits(value: number) {
        this._bits = value;
    }

    get diskLetter() {
        let letterID = this._id + 2;
        const digits = [];
        while(letterID > 0) {
            const nextDigit = letterID % 26 + 1;
            letterID = (letterID - nextDigit) / 26;
            digits.push(nextDigit);
        }

        return digits.reduce((letters, digit) => String.fromCharCode(64 + digit) + letters, "");
    }

    get name() {
        return `${this.storage}b Disk (${this.diskLetter}:)`
    }

    get storageUpgrade(): Purchase {
        return new Purchase(
            "Upgrade Storage",
            this.capacity * 3.75 * (3 ** this._id),
            () => {
                this._storage *= 2;
            },
        );
    }

    upgradeStorage(): void {
        this._storage *= 2;
    }

    get id() {
        return this._id;
    }

    get schema(): DiskSchema {
        return Disk.CODEC.parse(this);
    }
}