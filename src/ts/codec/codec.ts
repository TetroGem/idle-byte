import type t from 'io-ts';

export class Codec<T extends t.Props, P> {
    private typeCodec: t.TypeC<T>;
    private parser: (decoded: t.TypeOf<t.TypeC<T>>) => P;

    constructor(typeCodec: t.TypeC<T>, parser: (decoded: t.TypeOf<t.TypeC<T>>) => P) {
        this.typeCodec = typeCodec;
        this.parser = parser;
    }

    encode(data: unknown) {
        return this.typeCodec.encode(data as any);
    }
}