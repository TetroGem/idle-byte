import type { Player } from "./player";

export class Purchase {
    private readonly _name: string;
    private readonly _cost: number;
    private readonly _callback: (player: Player) => void;

    public constructor(name: string, cost: number, callback: (player: Player) => void) {
        this._name = name;
        this._cost = Math.floor(cost);
        this._callback = callback;
    }

    public get name() {
        return this._name;
    }

    public get cost() {
        return this._cost;
    }

    public get callback() {
        return this._callback;
    }
}