export const toDotNotation = <R extends Record<string, unknown>, I extends Record<string, unknown>>(input: I, parentKey = ''): R =>
    Object.keys(input || {}).reduce((acc, key) => {
        const value = input[key]
        const outputKey = parentKey ? `${parentKey}.${key}` : `${key}`

        // NOTE: remove `&& (!Array.isArray(value) || value.length)` to exclude empty arrays from the output
        if (value && typeof value === 'object' && (!Array.isArray(value) || value.length)) return { ...acc, ...toDotNotation(value as I, outputKey) }

        return { ...acc, [outputKey]: value }
    }, {} as R)

export const createPartial =
    <T extends Record<string, unknown> = Record<string, unknown>>() =>
    (partial: Partial<T>) =>
        partial

export type BreakDownObject<O, R = void> = {
    [K in keyof O as string]: K extends string ? (R extends string ? ObjectDotNotation<O[K], `${R}.${K}`> : ObjectDotNotation<O[K], K>) : never
}

export type ObjectDotNotation<O, R = void> = O extends string ? (R extends string ? R : never) : BreakDownObject<O, R>[keyof BreakDownObject<O, R>]
