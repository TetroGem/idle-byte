import { z } from "zod";
import { CostManager } from "./cost-manager";
import { Purchase } from "./purchase";

export type CloudSchema = z.TypeOf<typeof Cloud.CODEC>;

export class Cloud {
    static readonly DEFAULTS = {
        bits: 0,
        uploadSpeed: 64,
        uploadStartTime: null,
        currentUploadedBits: 0,
    } as const;

    static readonly CODEC = z.object({
        bits: z.number().default(Cloud.DEFAULTS.bits),
        uploadSpeed: z.number().default(Cloud.DEFAULTS.uploadSpeed),
        uploadStartTime: z.nullable(z.number()).default(Cloud.DEFAULTS.currentUploadedBits),
        currentUploadedBits: z.number().default(Cloud.DEFAULTS.currentUploadedBits),
    });

    static fromSchema(schema: CloudSchema): Cloud {
        const cloud = new Cloud();
        cloud.schema = schema;
        return cloud;
    }

    set schema(schema: CloudSchema) {
        this.bits = schema.bits;
        this.uploadSpeed = schema.uploadSpeed;
    }

    private _bits: number = Cloud.DEFAULTS.bits;
    get bits(): number {
        return this._bits;
    } private set bits(bits: number) {
        this._bits = bits;
    }

    private _uploadSpeed: number = Cloud.DEFAULTS.uploadSpeed; // in bps
    get uploadSpeed(): number {
        return this._uploadSpeed;
    } private set uploadSpeed(uploadSpeed: number) {
        this._uploadSpeed = uploadSpeed;
    }

    private uploadStartTime: number | null = Cloud.DEFAULTS.uploadStartTime;
    private currentUploadedBits: number = Cloud.DEFAULTS.currentUploadedBits;

    private readonly _uploadSpeedCostManager = new CostManager(
        512,
        (amount, prevCost) => prevCost ** 1.085,
        {
            initialAmount: 64,
            incrementer: prevAmount => prevAmount * 2,
        },
    )

    get uploadSpeedPurchase(): Purchase {
        return new Purchase(
            "x2 Upload Speed",
            this._uploadSpeedCostManager.getNextCostAt(this.uploadSpeed),
            () => this.uploadSpeed *= 2,
        );
    }

    startUpload(): void {
        if(this.uploadStartTime !== null) return;

        this.uploadStartTime = Date.now();
        this.currentUploadedBits = 0;
    }

    /**
     * @param bits The max number of bits to upload
     * @returns The number of bits that were successfully able to be uploaded
     */
    upload(bits: number): number {
        if(this.uploadStartTime === null) return 0;

        const uploadProgress = Math.min((Date.now() - this.uploadStartTime) / 1000, 1);
        const maxUploadableBits = Math.floor(uploadProgress * this.uploadSpeed) - this.currentUploadedBits;
        const uploadableBits = Math.max(Math.min(bits, maxUploadableBits), 0);

        this.bits += uploadableBits;
        this.currentUploadedBits += uploadableBits;

        if(this.currentUploadedBits >= this.uploadSpeed || bits === 0) {
            this.uploadStartTime = null;
        }

        return uploadableBits;
    }

    drain(bits: number): number {
        const bitsDrained = Math.min(bits, this.bits);
        this.bits -= bitsDrained;
        return bitsDrained;
    }
}