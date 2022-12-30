import { z } from "zod";

export type CloudSchema = z.TypeOf<typeof Cloud.CODEC>;

export class Cloud {
    static readonly CODEC = z.object({
        bits: z.number(),
    });

    set schema(schema: CloudSchema) {
        this.bits = schema.bits;
    }

    private _bits: number = 0;
    get bits(): number {
        return this._bits;
    } private set bits(bits: number) {
        this._bits = bits;
    }

    private _uploadSpeed: number = 8; // in bps
    get uploadSpeed(): number {
        return this._uploadSpeed;
    } private set uploadSpeed(uploadSpeed: number) {
        this._uploadSpeed = uploadSpeed;
    }

    private uploadStartTime: number | null = null;
    private currentUploadedBits: number = 0;

    startUpload(): void {
        if(this.uploadStartTime !== null) return;

        this.uploadStartTime = performance.now();
        this.currentUploadedBits = 0;
    }

    /**
     * @param bits The max number of bits to upload
     * @returns The number of bits that were successfully able to be uploaded
     */
    upload(bits: number): number {
        if(this.uploadStartTime === null) return 0;

        const uploadProgress = (performance.now() - this.uploadStartTime) / 1000;
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