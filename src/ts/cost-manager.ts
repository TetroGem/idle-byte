export class CostManager {
    private _initialCost: number;
    private _minAmount: number;
    private _calculator: (amount: number, prevCost: number) => number;
    private _lastComputedAmount: number | null = null;
    private _lastComputedCost: number = 0;

    public constructor(
        initialCost: number,
        calculator: (amount: number, prevCost: number) => number,
        minAmount: number = 0
    ) {
        this._initialCost = initialCost;
        this._minAmount = minAmount;
        this._calculator = calculator;
    }

    public getFor(amount: number): number {
        if(Number.isSafeInteger(amount) === false) throw new Error("Amount must be a safe integer");
        
        if(amount !== this._lastComputedAmount) {
            this._lastComputedCost = this._calculateCost(amount);
            this._lastComputedAmount = amount;
        }
        return this._lastComputedCost;
    }

    private _calculateCost(amount: number): number {
        if(Number.isSafeInteger(amount) === false) throw new Error("Amount must be a safe integer");

        let startAmount: number;
        let cost: number;
        if(this._lastComputedAmount === null || amount < this._lastComputedAmount) {
            cost = this._initialCost;
            startAmount = this._minAmount;
        } else {
            cost = this._lastComputedCost;
            startAmount = this._lastComputedAmount;
        }

        for(let i = startAmount + 1; i <= amount; i++) {
            cost = this._calculator(i, cost);
        }
        
        return cost;
    }
}