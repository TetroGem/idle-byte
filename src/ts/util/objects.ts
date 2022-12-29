export module Objects {
    export function values<K extends PropertyKey, V>(obj: { [P in K]: V }): V[] {
        return Object.keys(obj).map(_key => {
            const key = _key as K;
            return obj[key];
        });
    }
}