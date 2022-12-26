export class Disk {
    readonly storage: number;
    readonly cost: number;

    constructor(storage: number, cost: number) {
        this.storage = storage;
        this.cost = cost;
    }
}