import Dexie from 'dexie';

import type { Table } from 'dexie';

export class IdleBitDB extends Dexie {
    save!: Table<{
        data: string;
    }>;

    constructor() {
        super('idle-bit');
        this.version(1).stores({
            save: ',data',
        });
    }
}

export const db = new IdleBitDB();