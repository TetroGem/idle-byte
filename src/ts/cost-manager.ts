export class CostManager {
    private initialCost: number;
    private initialAmount: number;
    private calculator: (amount: number, prevCost: number) => number;
    private incrementer: (prevAmount: number) => number;
    private lastComputedAmount: number | null = null;
    private lastComputedCost: number = 0;

    public constructor(
        initialCost: number,
        calculator: (amount: number, prevCost: number) => number,
        options?: {
            initialAmount?: number,
            incrementer?: (prevAmount: number) => number,
        }
    ) {
        this.initialCost = initialCost;
        this.initialAmount = options?.initialAmount ?? 0;
        this.calculator = calculator;
        this.incrementer = options?.incrementer ?? ((prevAmount: number) => prevAmount + 1);
    }

    public getNextCostAt(amount: number): number {
        if(Number.isSafeInteger(amount) === false) throw new Error("Amount must be a safe integer");
        
        if(amount !== this.lastComputedAmount) {
            this.lastComputedCost = this.calculateCost(amount);
            this.lastComputedAmount = amount;
        }
        return this.lastComputedCost;
    }

    private calculateCost(amount: number): number {
        if(Number.isSafeInteger(amount) === false) throw new Error("Amount must be a safe integer");

        let startAmount: number;
        let cost: number;
        if(this.lastComputedAmount === null || amount < this.lastComputedAmount) {
            cost = this.initialCost;
            startAmount = this.initialAmount;
        } else {
            cost = this.lastComputedCost;
            startAmount = this.lastComputedAmount;
        }

        for(let i = this.incrementer(startAmount); i <= amount; i = this.incrementer(i)) {
            cost = this.calculator(i, cost);
        }
        
        return cost;
    }
}