import { z } from 'zod';

import { Purchase } from './purchase';
import { Strings } from './util/strings';

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

    get name() {
        return `${this.storage}b Disk (${this.diskLetter}:)`
    }

    _storage: number;
    get storage() {
        return this._storage;
    } private set storage(storage: number) {
        this._storage = storage;
    }

    get capacity() {
        return 2 ** this._storage - 1;
    }

    get storageUpgrade(): Purchase {
        return new Purchase(
            "x2 Storage",
            this.capacity * 3.75 * (3 ** this.id),
            () => this.storage *= 2,
        );
    }

    _bits: number = 0;
    get bits() {
        return this._bits;
    } private set bits(bits: number) {
        this._bits = bits;
    }

    get binaryBits(): string {
        const binary = this._bits.toString(2);
        return Strings.padStart(binary, this._storage, "0");
    }

    get isFull(): boolean {
        return this.bits >= this.capacity;
    }

    get schema(): DiskSchema {
        return Disk.CODEC.parse(this);
    }

    constructor(id: number, storage: number) {
        this._storage = storage;
        this.id = id;
    }

    increment(bits: number = 1): void {
        if(this.bits < this.capacity) this.bits += bits;
        if(this.bits > this.capacity) this.bits = this.capacity;
        // if(this.value >= 2 ** this.storage) this.value = 0; // overflow
    }

    /**
     * @param bits The maximum number of bits to deplete from this disk (can be larger than current value)
     * @returns The number of bits that were able to be removed from this disk
     */
    drain(bits: number): number {
        const depleted = Math.min(bits, this.bits);
        this.bits -= depleted;
        return depleted;
    }

    upgradeStorage(): void {
        this.storage *= 2;
    }
}